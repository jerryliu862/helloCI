import {
	EuiBreadcrumbs,
	EuiButton,
	EuiButtonEmpty,
	EuiConfirmModal,
	EuiContextMenuItem,
	EuiContextMenuPanel,
	EuiFieldSearch,
	EuiFlexGroup,
	EuiFlexItem,
	EuiPagination,
	EuiPopover,
	EuiSpacer,
	EuiTabbedContent,
	EuiTitle,
} from '@elastic/eui';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';
import { CustomTable } from '../CustomTable';
import { GlobalToastContext } from '../../store/GlobalToastProvider';
import apiUtil from '../../util/apiUtil';
import LoadingMask from '../common/LoadingMask';
import numberUtil from '../../util/numberUtil';
import DetailGrid from './DetailGrid';
import { EPayType, EReportTabId, IReportDetailData } from '../../util/utilModel';
import AgencyExpandTable from './AgencyExpandTable';
import { AllRegionCurrencyListContext } from 'src/store/AllRegionCurrencyListProvider';
import { downloadCsv } from 'src/util/downloadExcel';

const tabs = [
	{
		id: EPayType.LOCAL,
		name: 'Local',
		content: <></>,
	},
	{
		id: EPayType.FOREIGN,
		name: 'Foreign',
		content: <></>,
	},
	{
		id: EPayType.AGENCY,
		name: 'Agency',
		content: <></>,
	},
	{
		id: EPayType.MISSING,
		name: 'Missing',
		content: <></>,
	},
];

const initialDetailData = {
	id: 0,
	payDate: '',
	region: '',
	foreignAmount: 0,
	localAmount: 0,
	agencyAmount: 0,
	streamerCount: 0,
	missingCount: 0,
	totalAmount: 0,
	totalTaxAmount: 0,
	afterTaxAmount: 0,
	status: false,
};

const Detail = () => {
	const { regionCurrencyOptions } = useContext(AllRegionCurrencyListContext);
	const navigate = useNavigate();
	const { setToasts, handleAlertApiError } = useContext(GlobalToastContext);
	const { id, region, date } = useParams();
	const [reportDetailData, setReportDetailData] = useState<IReportDetailData>(initialDetailData);
	const [searchText, setSearchText] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [tab, setTab] = useState<string>(EPayType.LOCAL);
	const [isShowMarkModal, setIsShowMarkModal] = useState(false);
	const [toggleFetchDetail, setToggleFetchDetail] = useState(false);
	const [detailList, setDetailList] = useState([]);
	const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15, totalPage: 1 });
	const [isPopoverOpen, setIsPopoverOpen] = useState(false);
	const { pageIndex, pageSize, totalPage } = pagination;
	const targetCurrency = regionCurrencyOptions.find((item: any) => item.code === region);

	const handlePageIndexChange = (pageIndex: number) => {
		setPagination(pagination => ({ ...pagination, pageIndex }));
		setToggleFetchDetail(!toggleFetchDetail);
	};

	const breadcrumbs = [
		{
			text: 'Report',
			href: '/report',
		},
		{
			text: `${region}-${date}`,
		},
	];

	const fetchReportDetailOverview = async () => {
		setIsLoading(true);
		try {
			const result = await apiUtil.get(`/report/${id}`);
			setReportDetailData(result.data);
		} catch (error) {
			handleAlertApiError(error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleMarkedAsPaid = async () => {
		setIsLoading(true);
		try {
			const result = await apiUtil.put(`/payout/${id}/status`, {
				status: true,
			});
			setIsLoading(false);
			result.status === 200 &&
				setToasts({
					title: `Marked Success!`,
					color: 'success',
				});
			setIsShowMarkModal(false);
			navigate('/report');
		} catch (error) {
			setIsLoading(false);
			handleAlertApiError(error);
		}
	};

	const fetchReportDetail = async () => {
		setIsLoading(true);
		try {
			const result = await apiUtil.get(`/report/${id}/detail`, {
				params: {
					id,
					payType: tab,
					keyword: searchText,
					pageSize: pageSize,
					pageNo: pageIndex + 1,
				},
			});
			setDetailList(result.data ?? []);
			const totalDataLength = Number(result.headers['x-total-count']) ?? 0;
			setPagination(prev => ({
				...prev,
				totalPage:
					totalDataLength === 0
						? 1
						: totalDataLength % pageSize === 0
						? Math.floor(totalDataLength / pageSize)
						: Math.floor(totalDataLength / pageSize) + 1,
			}));
		} catch (error) {
			handleAlertApiError(error);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchReportDetailOverview();
	}, []);

	useEffect(() => {
		fetchReportDetail();
	}, [toggleFetchDetail]);

	const overviewTableColumns = [
		{
			field: 'payDate',
			name: 'Month',
			render: (value: string) => value ?? '--',
		},
		{
			field: 'region',
			name: 'Region',
			render: (value: string) => value ?? '--',
		},
		{
			field: 'foreignAmount',
			name: 'Foreign',
			render: (value: string) =>
				`${targetCurrency?.currencyCode} ${numberUtil.amountFormat(value, targetCurrency?.currencyFormat)}`,
		},
		{
			field: 'agencyAmount',
			name: 'Agency',
			render: (value: string) =>
				`${targetCurrency?.currencyCode} ${numberUtil.amountFormat(value, targetCurrency?.currencyFormat)}`,
		},
		{
			field: 'localAmount',
			name: 'Local',
			render: (value: string) =>
				`${targetCurrency?.currencyCode} ${numberUtil.amountFormat(value, targetCurrency?.currencyFormat)}`,
		},
		{
			field: 'streamerCount',
			name: 'Number',
			render: (value: string) => value ?? '--',
		},
		{
			field: 'totalAmount',
			name: 'Total',
			render: (value: string) =>
				`${targetCurrency?.currencyCode} ${numberUtil.amountFormat(value, targetCurrency?.currencyFormat)}`,
		},
		{
			field: 'totalTaxAmount',
			name: 'Tax',
			render: (value: string) =>
				`${targetCurrency?.currencyCode} ${numberUtil.amountFormat(value, targetCurrency?.currencyFormat)}`,
		},
		{
			field: 'afterTaxAmount',
			name: 'After tax',
			render: (value: string) =>
				`${targetCurrency?.currencyCode} ${numberUtil.amountFormat(value, targetCurrency?.currencyFormat)}`,
		},
		{
			field: 'status',
			name: 'Status',
			render: (value: boolean) => (value ? 'Paid' : 'Grouped'),
		},
	];

	const popoverButton = useMemo(
		() => (
			<EuiButtonEmpty
				size="xs"
				color="text"
				iconType="arrowDown"
				iconSide="right"
				onClick={() => setIsPopoverOpen(!isPopoverOpen)}
			>
				Rows per page: {pagination.pageSize}
			</EuiButtonEmpty>
		),
		[pagination, isPopoverOpen],
	);

	const closePopover = useCallback(() => setIsPopoverOpen(false), [setIsPopoverOpen]);

	const handlePageSizeChange = (size: number) => {
		closePopover();
		setPagination(prev => ({ ...prev, pageSize: size, pageIndex: 0 }));
		setToggleFetchDetail(!toggleFetchDetail);
	};

	const pageSizeItemComponents = [15, 50, 100].map((size: number) => (
		<EuiContextMenuItem
			key={`${size}-row`}
			icon={size === pagination.pageSize ? 'check' : 'empty'}
			onClick={() => {
				handlePageSizeChange(size);
			}}
		>
			{`${size} rows`}
		</EuiContextMenuItem>
	));

	return (
		<div>
			<EuiTitle size="l">
				<h1>{`${region}-${date}`}</h1>
			</EuiTitle>
			<EuiSpacer />
			<EuiFlexGroup wrap>
				<EuiFlexItem>
					<Breadcrumbs max={4} breadcrumbs={breadcrumbs} aria-label="An Breadcrumbs" />
				</EuiFlexItem>
				<EuiFlexItem grow={false}>
					<ButtonGroup>
						<EuiButton fill onClick={() => downloadCsv(id)}>
							Download Excel
						</EuiButton>
						<ModalButton
							fill
							disabled={reportDetailData.status}
							onClick={() => {
								setIsShowMarkModal(true);
							}}
						>
							Marked as Paid
						</ModalButton>
					</ButtonGroup>
				</EuiFlexItem>
			</EuiFlexGroup>
			<CustomTable
				tableCaption="Payout Overview Table"
				items={[reportDetailData]}
				rowHeader="budget"
				columns={overviewTableColumns}
			/>
			<EuiSpacer size="l" />
			<ContentHeader>
				<SearchBarWrapper>
					<EuiFieldSearch
						placeholder="Search by User id, Open id, Account Name"
						value={searchText}
						onChange={(e: any) => setSearchText(e.target.value)}
						isClearable={true}
						aria-label="Use aria labels when no actual label is in use"
						onKeyDown={(e: any) => {
							if (e.keyCode === 13) {
								setPagination(pagination => ({ ...pagination, pageIndex: 0 }));
								setToggleFetchDetail(!toggleFetchDetail);
							}
						}}
					/>
				</SearchBarWrapper>
				<EuiTabbedContent
					tabs={tabs}
					initialSelectedTab={tabs[0]}
					autoFocus="selected"
					onTabClick={tab => {
						setTab(tab.id);
						setSearchText('');
						setPagination(pagination => ({ ...pagination, pageIndex: 0 }));
						setToggleFetchDetail(!toggleFetchDetail);
					}}
				/>
			</ContentHeader>
			{tab === EPayType.AGENCY ? (
				<AgencyExpandTable detailList={detailList} searchText={searchText} />
			) : (
				<DetailGrid detailList={detailList} searchText={searchText} />
			)}
			<EuiFlexGroup justifyContent="spaceBetween" alignItems="center" responsive={false} wrap>
				<EuiFlexItem grow={false}>
					<EuiPopover
						button={popoverButton}
						isOpen={isPopoverOpen}
						closePopover={closePopover}
						panelPaddingSize="none"
					>
						<EuiContextMenuPanel items={pageSizeItemComponents} />
					</EuiPopover>
				</EuiFlexItem>
				<EuiFlexItem grow={false}>
					<EuiPagination
						aria-label="Custom pagination example"
						pageCount={totalPage}
						activePage={pageIndex}
						onPageClick={handlePageIndexChange}
					/>
				</EuiFlexItem>
			</EuiFlexGroup>
			{isLoading && <LoadingMask />}
			{isShowMarkModal && (
				<EuiConfirmModal
					title={
						<TableSubtitle size="s">
							<ModalTitle>Mark as Paid?</ModalTitle>
						</TableSubtitle>
					}
					onCancel={() => {
						setIsShowMarkModal(false);
					}}
					onConfirm={() => {
						handleMarkedAsPaid();
					}}
					cancelButtonText="Cancel"
					confirmButtonText="Confirm"
					buttonColor="danger"
				>
					<p>{`You can't recover marked data.`}</p>
				</EuiConfirmModal>
			)}
		</div>
	);
};

export default Detail;
const Breadcrumbs = styled(EuiBreadcrumbs)`
	.euiLink.euiLink--subdued {
		color: blue;
	}
`;

const ContentHeader = styled.div`
	position: relative;
`;

const SearchBarWrapper = styled.div`
	width: 500px;
	position: absolute;
	bottom: 12px;
	right: 0;
	z-index: 10;
`;

const TableSubtitle = styled(EuiTitle)`
	margin-bottom: 20px;
`;

const ModalTitle = styled.h1`
	margin: 0;
`;

const ModalButton = styled(EuiButton)`
	margin-left: 20px;
`;

const ButtonGroup = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
`;
