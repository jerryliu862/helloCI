import {
	EuiPageHeader,
	EuiPageHeaderSection,
	EuiTitle,
	EuiBreadcrumbs,
	EuiButton,
	EuiBasicTable,
	EuiTabbedContent,
	EuiConfirmModal,
	EuiFieldSearch,
	EuiPagination,
	EuiFlexItem,
	EuiContextMenuPanel,
	EuiFlexGroup,
	EuiPopover,
	EuiButtonEmpty,
	EuiContextMenuItem,
} from '@elastic/eui';
import moment from 'moment';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AllRegionCurrencyListContext } from 'src/store/AllRegionCurrencyListProvider';
import styled from 'styled-components';
import { theme } from 'styled-tools';
import LoadingMask from '../components/common/LoadingMask';
import AddAdjustmentModal from '../components/payout/AddAdjustmentModal';
import PayoutDetailDataGrid from '../components/payout/PayoutDetailDataGrid';
import UpdateDateModal from '../components/payout/UpdateDateModal';
import { GlobalToastContext } from '../store/GlobalToastProvider';
import apiUtil from '../util/apiUtil';
import numberUtil from '../util/numberUtil';
import { EBonusType, EPayoutTabName, IPayoutDetailListItem } from '../util/utilModel';

const tabs = [
	{
		id: 'all--id',
		name: EPayoutTabName.ALL,
		content: <></>,
	},
	{
		id: 'bonus--id',
		name: EPayoutTabName.BONUS,
		content: <></>,
	},
	{
		id: 'addon--id',
		name: EPayoutTabName.ADDON,
		content: <></>,
	},
	{
		id: 'deduction--id',
		name: EPayoutTabName.DEDUCTION,
		content: <></>,
	},
	{
		id: 'transportation--id',
		name: EPayoutTabName.TRANSPORTATION,
		content: <></>,
	},
];

const tabValueMap = {
	[EPayoutTabName.ALL]: null,
	[EPayoutTabName.BONUS]: EBonusType.FIXED_BONUS,
	[EPayoutTabName.ADDON]: EBonusType.ADDON,
	[EPayoutTabName.DEDUCTION]: EBonusType.DEDUCTION,
	[EPayoutTabName.TRANSPORTATION]: EBonusType.TRANSPORTATION,
};

interface IOverviewData {
	addon: number;
	budget: number;
	deduction: number;
	difference: number;
	fixedBonus: number;
	id: number;
	payDate: string;
	region: string;
	status: number;
	total: number;
	transportation: number;
	variableBonus: number;
}

const initialDetailData = {
	addon: 0,
	budget: 0,
	deduction: 0,
	difference: 0,
	fixedBonus: 0,
	id: 0,
	payDate: '',
	region: '',
	status: 0,
	total: 0,
	transportation: 0,
	variableBonus: 0,
};

const PayoutDetail: React.FC = () => {
	const { regionCurrencyOptions } = useContext(AllRegionCurrencyListContext);
	const { setToasts, handleAlertApiError } = useContext(GlobalToastContext);
	const { region = '', payDate = '', id = '0' } = useParams();
	const navigate = useNavigate();
	const [overviewData, setOverviewData] = useState<IOverviewData>(initialDetailData);
	const [detailList, setDetailList] = useState<IPayoutDetailListItem[] | []>([]);
	const [searchText, setSearchText] = useState('');
	const [isShowAdjustmentModal, setIsShowAdjustmentModal] = useState(false);
	const [isShowMarkModal, setIsShowMarkModal] = useState(false);
	const [isShowDeleteModal, setIsShowDeleteModal] = useState(false);
	const [selectData, setSelectData] = useState(null);
	const [selectGroupData, setSelectGroupData] = useState<any[]>([]);
	const [currentTab, setCurrentTab] = useState<any>(EPayoutTabName.ALL);
	const [isShowUpdateDateModal, setIsShowUpdateDateModal] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15, totalPage: 1 });
	const { pageIndex, pageSize, totalPage } = pagination;
	const [isPopoverOpen, setIsPopoverOpen] = useState(false);
	const [toggleRefetch, setToggleRefetch] = useState(false);
	const [regionCode, setRegionCode] = useState('');
	const detailTargetCurrency = regionCurrencyOptions.find((item: any) => item.code === region);
	const targetCurrency = regionCurrencyOptions.find((item: any) => !selectData && item.currencyCode === regionCode);
	const handlePageIndexChange = (pageIndex: number) => {
		setPagination(pagination => ({ ...pagination, pageIndex }));
		setToggleRefetch(!toggleRefetch);
	};

	const handlePageSizeChange = (size: number) => {
		closePopover();
		setPagination(prev => ({ ...prev, pageSize: size, pageIndex: 0 }));
		setToggleRefetch(!toggleRefetch);
	};

	const groupPayout = async () => {
		setIsLoading(true);
		try {
			const result = await apiUtil.post(`/payout/group`, {
				region: overviewData.region,
				payDate: `${overviewData.payDate}-01`,
			});
			setIsLoading(false);
			if (result.status === 200) {
				setToasts({
					title: `Group Payout Success!`,
					color: 'success',
				});
				setIsShowMarkModal(false);
				navigate(`/payout?date=${payDate}`);
			}
		} catch (error) {
			setIsLoading(false);
			handleAlertApiError(error);
		}
	};

	const deletePayout = async () => {
		setIsLoading(true);
		try {
			const result = await apiUtil.delete(`/payout/adjustment/${selectData.bonusID}`);
			setIsLoading(false);
			if (result.status === 200) {
				setToasts({
					title: `Delete Payout Success!`,
					color: 'success',
				});
				setIsShowDeleteModal(false);
				refreshFetchData();
			}
			if (result.status === 204) {
				setToasts({
					title: `NoData!`,
					color: 'danger',
				});
				setIsShowDeleteModal(false);
				navigate('/payout');
			}
		} catch (error) {
			setIsLoading(false);
			handleAlertApiError(error);
		}
	};

	const fetchDetailWithDateAndRegion = async () => {
		setIsLoading(true);
		try {
			const result = await apiUtil.get(`/payout/detail`, {
				params: {
					payDate,
					region,
					pageSize,
					pageNo: pageIndex + 1,
					...(searchText ? { keyword: searchText } : {}),
					...(tabValueMap[currentTab] !== null ? { bonusType: tabValueMap[currentTab] } : {}),
				},
			});
			const data = result.data ?? [];
			const newDetailList = (data || []).map((item: any) => ({ ...item, payDate }));
			setDetailList(newDetailList);
			const totalDataLength = Number(result.headers['x-total-count']) ?? 0;
			setPagination(prev => ({
				...prev,
				totalPage:
					totalDataLength % pageSize === 0
						? Math.floor(totalDataLength / pageSize)
						: Math.floor(totalDataLength / pageSize) + 1,
			}));
		} catch (error) {
			handleAlertApiError(error);
		} finally {
			setIsLoading(false);
		}
	};

	const fetchDetailWithId = async () => {
		setIsLoading(true);
		try {
			const result = await apiUtil.get(`/payout/${id}/detail`, {
				params: {
					pageSize,
					pageNo: pageIndex + 1,
					...(searchText ? { keyword: searchText } : {}),
					...(tabValueMap[currentTab] !== null ? { bonusType: tabValueMap[currentTab] } : {}),
				},
			});
			const data = result.data ?? [];
			const newDetailList = (data || []).map((item: any) => ({ ...item, payDate: data.payDate ?? '' }));
			setDetailList(newDetailList);
			const totalDataLength = Number(result.headers['x-total-count']) ?? 0;
			setPagination(prev => ({
				...prev,
				totalPage:
					totalDataLength % pageSize === 0
						? Math.floor(totalDataLength / pageSize)
						: Math.floor(totalDataLength / pageSize) + 1,
			}));
		} catch (error) {
			handleAlertApiError(error);
		} finally {
			setIsLoading(false);
		}
	};

	const fetchOverViewData = async () => {
		setIsLoading(true);
		try {
			const result = await apiUtil.get(`/payout/${id}`);
			const newData = result.data ?? {};
			setOverviewData({ ...newData, payDate: moment(newData.payDate).format('YYYY-MM') });
		} catch (error) {
			handleAlertApiError(error);
		} finally {
			setIsLoading(false);
		}
	};

	const fetchUnGroupOverViewData = async () => {
		setIsLoading(true);
		try {
			const result = await apiUtil.get(`/payout`, {
				params: {
					pageSize: 1,
					pageNo: 1,
					region,
					date: payDate,
				},
			});
			const newData = result.data?.[0] ?? {};
			setOverviewData({ ...newData, payDate: moment(newData.payDate).format('YYYY-MM') });
		} catch (error) {
			handleAlertApiError(error);
		} finally {
			setIsLoading(false);
		}
	};

	const refreshFetchData = id === '0' ? fetchDetailWithDateAndRegion : fetchDetailWithId;

	const fetchOverView = id === '0' ? fetchUnGroupOverViewData : fetchOverViewData;

	useEffect(() => {
		!isShowAdjustmentModal && setSelectData(null);
		setRegionCode('');
	}, [isShowAdjustmentModal]);

	useEffect(() => {
		fetchOverView();
	}, [id]);

	useEffect(() => {
		refreshFetchData();
	}, [toggleRefetch]);

	const breadcrumbs = [
		{
			text: 'Payout',
			href: '#',
			onClick: (e: any) => {
				e.preventDefault();
				navigate('/payout');
			},
		},
		{
			text: `${region}-${moment(payDate).format('YYYY-MM')}`,
		},
	];

	const closePopover = useCallback(() => setIsPopoverOpen(false), [setIsPopoverOpen]);

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

	const overviewTableColumns = [
		{
			field: 'payDate',
			name: 'Month',
			render: (value: string) => (value ? value : '--'),
		},
		{
			field: 'region',
			name: 'Region',
			render: (value: string) => (value ? value : '--'),
		},
		{
			field: 'fixedBonus',
			name: 'Fixed Bonus',
			render: (value: number) =>
				`${detailTargetCurrency?.currencyCode} ${numberUtil.amountFormat(
					value ?? 0,
					detailTargetCurrency?.currencyFormat,
				)}`,
		},
		{
			field: 'variableBonus',
			name: 'Variable Bonus',
			render: (value: number) =>
				`${detailTargetCurrency?.currencyCode} ${numberUtil.amountFormat(
					value ?? 0,
					detailTargetCurrency?.currencyFormat,
				)}`,
		},
		{
			field: 'budget',
			name: 'Budget',
			render: (value: number) =>
				`${detailTargetCurrency?.currencyCode} ${numberUtil.amountFormat(
					value ?? 0,
					detailTargetCurrency?.currencyFormat,
				)}`,
		},
		{
			field: 'transportation',
			name: 'Transportation',
			render: (value: number) =>
				`${detailTargetCurrency?.currencyCode} ${numberUtil.amountFormat(
					value ?? 0,
					detailTargetCurrency?.currencyFormat,
				)}`,
		},
		{
			field: 'addon',
			name: 'Addon',
			render: (value: number) =>
				`${detailTargetCurrency?.currencyCode} ${numberUtil.amountFormat(
					value ?? 0,
					detailTargetCurrency?.currencyFormat,
				)}`,
		},
		{
			field: 'deduction',
			name: 'Deduction',
			render: (value: number) =>
				`${detailTargetCurrency?.currencyCode} ${numberUtil.amountFormat(
					value ?? 0,
					detailTargetCurrency?.currencyFormat,
				)}`,
		},
		{
			field: 'total',
			name: 'Total',
			render: (value: number) =>
				`${detailTargetCurrency?.currencyCode} ${numberUtil.amountFormat(
					value ?? 0,
					detailTargetCurrency?.currencyFormat,
				)}`,
		},
		{
			field: 'difference',
			name: 'Difference',
			render: (value: number) =>
				`${detailTargetCurrency?.currencyCode} ${numberUtil.amountFormat(
					value ?? 0,
					detailTargetCurrency?.currencyFormat,
				)}`,
		},
		{
			field: 'status',
			name: 'Status',
			render: (value: number) => {
				switch (value) {
					case 0:
						return 'Ungrouped';
					case 1:
						return 'Grouped';
					case 2:
						return 'Paid';

					default:
						return value;
				}
			},
		},
	];

	const isGroupPayoutButtonHide = moment(payDate).isBefore(moment().startOf('month'));
	const isGroup = id !== '0';
	const isPaid = overviewData?.status === 2;

	return (
		<div>
			<EuiPageHeader alignItems="center" bottomBorder>
				<EuiPageHeaderSection>
					<EuiTitle size="l">
						<h1>{`${region}-${moment(payDate).format('YYYY-MM')}`}</h1>
					</EuiTitle>
				</EuiPageHeaderSection>
			</EuiPageHeader>
			<BreadRowWrapper>
				<CustomBread breadcrumbs={breadcrumbs} truncate={false} />
				<ButtonGroup>
					<ModalButton
						fill
						size="s"
						onClick={() => setIsShowUpdateDateModal(true)}
						disabled={selectGroupData.length <= 0 || isPaid}
					>
						{`Change Payout Month`}
					</ModalButton>
					<ModalButton
						fill
						size="s"
						disabled={isPaid}
						onClick={() => {
							setSelectData(null);
							setIsShowAdjustmentModal(true);
						}}
					>
						Add Adjustment
					</ModalButton>
					<ModalButton
						style={{ display: isGroupPayoutButtonHide ? 'none' : 'inline' }}
						fill
						size="s"
						disabled={isGroup}
						onClick={() => {
							setIsShowMarkModal(true);
						}}
					>
						Group Payout
					</ModalButton>
				</ButtonGroup>
			</BreadRowWrapper>
			<CustomTable
				tableCaption="Payout Overview Table"
				items={[overviewData]}
				rowHeader="budget"
				columns={overviewTableColumns}
			/>
			<TabsContentWrapper>
				<EuiTabbedContent
					tabs={tabs}
					initialSelectedTab={tabs[0]}
					autoFocus="selected"
					onTabClick={tab => {
						setSelectGroupData([]);
						setSearchText('');
						setPagination(prev => ({ ...prev, pageIndex: 0 }));
						setCurrentTab(tab.name);
						setToggleRefetch(!toggleRefetch);
					}}
				/>
				<PayoutDetailDataGrid
					gridData={detailList}
					setModalShow={setIsShowAdjustmentModal}
					setSelectData={setSelectData}
					setSelectGroupData={setSelectGroupData}
					setIsShowDeleteModal={setIsShowDeleteModal}
					selectGroupData={selectGroupData}
					targetCurrency={detailTargetCurrency}
					isPaid={isPaid}
					searchText={searchText}
				/>
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
				<EuiFieldSearch
					placeholder="Search by campaign title, user id, open id"
					value={searchText}
					onChange={e => setSearchText(e.target.value)}
					isClearable={true}
					aria-label="Use aria labels when no actual label is in use"
					onKeyDown={(e: any) => {
						if (e.keyCode === 13) {
							setPagination(pagination => ({ ...pagination, pageIndex: 0 }));
							setToggleRefetch(!toggleRefetch);
						}
					}}
				/>
			</TabsContentWrapper>
			{isShowUpdateDateModal && (
				<UpdateDateModal
					setSelectGroupData={setSelectGroupData}
					setIsShowUpdateDateModal={setIsShowUpdateDateModal}
					refreshFetchData={refreshFetchData}
					setIsLoading={setIsLoading}
					selectGroupData={selectGroupData}
				/>
			)}
			{isShowAdjustmentModal && (
				<AddAdjustmentModal
					setIsShowAdjustmentModal={setIsShowAdjustmentModal}
					selectData={selectData}
					setRegionCode={setRegionCode}
					refresh={refreshFetchData}
					targetCurrency={!selectData ? targetCurrency : detailTargetCurrency}
				/>
			)}
			{isShowMarkModal && (
				<EuiConfirmModal
					title={
						<TableSubtitle size="s">
							<ModalTitle>Mark as Group?</ModalTitle>
						</TableSubtitle>
					}
					onCancel={() => {
						setIsShowMarkModal(false);
					}}
					onConfirm={() => {
						groupPayout();
					}}
					cancelButtonText="Cancel"
					confirmButtonText="Confirm"
					buttonColor="danger"
				>
					<p>{`You can't recover marked data.`}</p>
				</EuiConfirmModal>
			)}
			{isShowDeleteModal && (
				<EuiConfirmModal
					title={
						<TableSubtitle size="s">
							<ModalTitle>Delete the data in payout ?</ModalTitle>
						</TableSubtitle>
					}
					onCancel={() => {
						setIsShowDeleteModal(false);
					}}
					onConfirm={() => {
						deletePayout();
					}}
					cancelButtonText="Cancel"
					confirmButtonText="Delete"
					buttonColor="danger"
				>
					<p>{`You can't recover deleted data.`}</p>
				</EuiConfirmModal>
			)}
			{isLoading && <LoadingMask />}
		</div>
	);
};

export default PayoutDetail;

const BreadRowWrapper = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
`;

const CustomBread = styled(EuiBreadcrumbs)`
	.euiLink.euiLink--subdued {
		color: ${theme('colors.customColorPrimary')};
	}
	margin: 20px 0;
`;

const ButtonGroup = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
`;

const ModalButton = styled(EuiButton)`
	margin-left: 20px;
`;
const CustomTable = styled(EuiBasicTable)`
	margin: 20px 0 40px;
	.euiTableCellContent {
		display: flex;
		justify-content: center;
		align-items: center;
		border-right: 1px solid ${theme('colors.lightShade')};
	}
	thead {
		background-color: ${theme('colors.lightestShade')};
	}
	table {
		border-top: 1px solid ${theme('colors.lightShade')};
		border-left: 1px solid ${theme('colors.lightShade')};
		border-bottom: 1px solid ${theme('colors.lightShade')};
	}
`;

const TableSubtitle = styled(EuiTitle)`
	margin-bottom: 20px;
`;

const ModalTitle = styled.h1`
	margin: 0;
`;

const TabsContentWrapper = styled.div`
	position: relative;
	.euiFormControlLayout {
		position: absolute;
		right: 0;
		top: 0;
	}
	.euiTab .euiTab__content {
		line-height: 50px;
	}
`;
