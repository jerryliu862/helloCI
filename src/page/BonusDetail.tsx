import {
	EuiBreadcrumbs,
	EuiPageHeader,
	EuiPageHeaderSection,
	EuiTitle,
	EuiBasicTable,
	EuiButton,
	EuiFieldSearch,
	EuiConfirmModal,
} from '@elastic/eui';
import moment from 'moment';
import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { theme } from 'styled-tools';
import DetailDataGrid from '../components/bonus/DetailDataGrid';
import DataInfo from '../components/DataInfo';
import apiUtil from '../util/apiUtil';
import { isEmpty } from 'lodash';
import { ICampaignDetailData, IResponse } from '../util/utilModel';
import LoadingMask from '../components/common/LoadingMask';
import { GlobalToastContext } from '../store/GlobalToastProvider';
import { AllRegionCurrencyListContext } from 'src/store/AllRegionCurrencyListProvider';
import numberUtil from 'src/util/numberUtil';

const TimeFormat = (value: any) => (value ? moment.unix(value).format('YYYY-MM-DD') : '--');

const BonusDetail: React.FC = () => {
	const { regionCurrencyOptions } = useContext(AllRegionCurrencyListContext);
	const { campaignId = '' } = useParams();
	const { setToasts, handleAlertApiError } = useContext(GlobalToastContext);
	const navigate = useNavigate();
	const [searchId, setSearchId] = useState('');
	const [isShowApprovalModal, setIsShowApprovalModal] = useState(false);
	const [campaign, setCampaign] = useState<ICampaignDetailData>({});
	const [rankList, setRankList] = useState([]);
	const [isLoading, setLoading] = useState(false);
	const targetCurrency = regionCurrencyOptions.find((item: any) => item.code === campaign.region);

	useEffect(() => {
		if (isEmpty(campaign)) {
			return;
		}
		const list = campaign.leaderboardList
			.map((item: any) => {
				return item.rankList.map(list => {
					return { name: item.name, ...list };
				});
			})
			.flat();
		setRankList(list);
	}, [campaign]);

	useEffect(() => {
		fetchCampaignDataById();
	}, []);

	const breadcrumbs = [
		{
			text: 'Bonus',
			href: '/bonus',
		},
		{
			text: `ID:${campaignId}`,
		},
	];

	const { id, startTime, title, endTime, region, remark } = campaign;

	const infoData = [
		{ title: 'Campaign ID', value: `${id || '-'}` },
		{ title: 'Start Date', value: TimeFormat(startTime) },
		{ title: 'Campaign Title', value: `${title || '-'}` },
		{ title: 'End Date', value: TimeFormat(endTime) },
		{ title: 'Region', value: `${region || '-'}` },
		{ title: 'Remark', value: `${remark || '-'}` },
	];

	const stageTableColumns = [
		{
			field: 'name',
			name: 'Stage',
			render: (value: string) => value ?? '--',
		},
		{
			field: 'fixedBonus',
			name: 'Fixed Bonus',
			render: (value: number) =>
				`${targetCurrency?.currencyCode} ${numberUtil.amountFormat(
					value ?? 0,
					targetCurrency?.currencyFormat,
				)}`,
		},
		{
			field: 'variableBonus',
			name: 'Variable Bonus',
			render: (value: number) =>
				`${targetCurrency?.currencyCode} ${numberUtil.amountFormat(
					value ?? 0,
					targetCurrency?.currencyFormat,
				)}`,
		},
		{
			field: 'totalBonus',
			name: 'Total Bonus',
			render: (value: number) =>
				`${targetCurrency?.currencyCode} ${numberUtil.amountFormat(
					value ?? 0,
					targetCurrency?.currencyFormat,
				)}`,
		},
	];

	const overviewTableColumns = [
		{
			field: 'budget',
			name: 'Budget',
			render: (value: number) =>
				`${targetCurrency?.currencyCode} ${numberUtil.amountFormat(
					value ?? 0,
					targetCurrency?.currencyFormat,
				)}`,
		},
		{
			field: 'totalBonus',
			name: 'Bonus',
			render: (value: number) =>
				`${targetCurrency?.currencyCode} ${numberUtil.amountFormat(
					value ?? 0,
					targetCurrency?.currencyFormat,
				)}`,
		},
		{
			field: 'bonusDiff',
			name: 'Difference',
			render: (value: number) =>
				`${targetCurrency?.currencyCode} ${numberUtil.amountFormat(
					value ?? 0,
					targetCurrency?.currencyFormat,
				)}`,
		},
		{
			field: 'approvalStatus',
			name: 'Approval Status',
			render: (value: boolean) => (value ? 'Approved' : 'Waiting'),
		},
		{
			field: 'approvalTime',
			name: 'Approval Time',
			render: (value: string) => {
				const date = new Date(value);
				return value ? moment(date).format('YYYY-MM-DD ') : '--';
			},
		},
		{
			field: 'approverName',
			name: 'Approver',
			render: (value: string) => value ?? '--',
		},
	];

	const fetchCampaignDataById = async () => {
		setLoading(true);
		try {
			const result: IResponse<ICampaignDetailData> = await apiUtil.get(`/campaign/${campaignId}`);
			setCampaign(result.data);
		} catch (error) {
			handleAlertApiError(error);
		} finally {
			setLoading(false);
		}
	};

	const handleApprovalEvent = async () => {
		try {
			const result = await apiUtil.put(`/campaign/${campaignId}/approve`);
			setToasts({
				title: 'Approval Success!',
				color: 'success',
			});
			fetchCampaignDataById();
			setIsShowApprovalModal(false);
		} catch (error) {
			handleAlertApiError(error);
		}
	};

	if (isLoading) {
		return <LoadingMask />;
	}

	return (
		<div>
			<EuiPageHeader alignItems="center" bottomBorder>
				<EuiPageHeaderSection>
					<EuiTitle size="l">
						<h1>{`ID:${campaignId}`}</h1>
					</EuiTitle>
				</EuiPageHeaderSection>
			</EuiPageHeader>
			<BreadRowWrapper>
				<CustomBread breadcrumbs={breadcrumbs} truncate={false} />
				<ButtonGroup>
					<EditApproveButton
						fill
						size="s"
						onClick={() => {
							navigate(`/bonus/detail/${campaignId}/edit`);
						}}
					>
						Edit
					</EditApproveButton>
					{!isEmpty(campaign) && !campaign.approvalStatus && (
						<EditApproveButton
							fill
							size="s"
							onClick={() => {
								setIsShowApprovalModal(true);
							}}
						>
							Approve
						</EditApproveButton>
					)}
				</ButtonGroup>
			</BreadRowWrapper>
			<DataInfoWrapper>
				<DataInfo infoData={infoData} />
			</DataInfoWrapper>
			<TableSubtitle size="s">
				<h1>Bonus Overview</h1>
			</TableSubtitle>
			<CustomTable
				tableCaption="Bonus Overview Table"
				items={[campaign]}
				rowHeader="budget"
				columns={overviewTableColumns}
			/>
			<TableSubtitle size="s">
				<h1>Bonus Breakdown by Stage</h1>
			</TableSubtitle>
			{campaign?.leaderboardList && (
				<CustomTable
					tableCaption="Bonus Breakdown by Stage Table"
					items={campaign.leaderboardList}
					rowHeader="stage"
					columns={stageTableColumns}
				/>
			)}
			<BreadRowWrapper>
				<TableSubtitle size="s">
					<h1>Bonus Breakdown by Rank</h1>
				</TableSubtitle>
				<EuiFieldSearch
					placeholder="Search by Open ID, User ID"
					value={searchId}
					onChange={(e: any) => setSearchId(e.target.value)}
					isClearable={true}
					aria-label="Use aria labels when no actual label is in use"
				/>
			</BreadRowWrapper>
			<DetailDataGrid rankList={rankList} searchId={searchId} targetCurrency={targetCurrency} />
			{isShowApprovalModal && (
				<EuiConfirmModal
					title={
						<TableSubtitle size="s">
							<ModalTitle>Confirm Bonus Approval</ModalTitle>
						</TableSubtitle>
					}
					onCancel={() => {
						setIsShowApprovalModal(false);
					}}
					onConfirm={handleApprovalEvent}
					cancelButtonText="Cancel"
					confirmButtonText="Confirm Approval"
					defaultFocusedButton="confirm"
				>
					<p>{`The approval can't be undone.`}</p>
					<ModalContentListWrapper>
						<ModalListItem>
							<ListItemTitleCell>{'- Campaign Title:'}</ListItemTitleCell>
							<span>{campaign?.title ?? '-'}</span>
						</ModalListItem>
						<ModalListItem>
							<ListItemTitleCell>{'- Total Budget:'}</ListItemTitleCell>
							<span>
								{`${campaign.region.toLocaleUpperCase()}D `} {campaign?.budget?.toLocaleString() ?? '-'}
							</span>
						</ModalListItem>
						<ModalListItem>
							<ListItemTitleCell>{'- Total Bonus:'}</ListItemTitleCell>
							<span>
								{`${campaign.region.toLocaleUpperCase()}D `}{' '}
								{campaign?.totalBonus?.toLocaleString() ?? '-'}
							</span>
						</ModalListItem>
						<ModalListItem>
							<ListItemTitleCell>{'- Difference:'}</ListItemTitleCell>
							<span>
								{`${campaign.region.toLocaleUpperCase()}D `}{' '}
								{campaign?.bonusDiff?.toLocaleString() ?? '-'}
							</span>
						</ModalListItem>
					</ModalContentListWrapper>
				</EuiConfirmModal>
			)}
		</div>
	);
};
export default BonusDetail;

const DataInfoWrapper = styled.div`
	margin: 10px 0 20px;
`;

const CustomBread = styled(EuiBreadcrumbs)`
	.euiLink.euiLink--subdued {
		color: ${theme('colors.customColorPrimary')};
	}
	margin: 20px 0;
`;

const TableSubtitle = styled(EuiTitle)`
	margin-bottom: 20px;
`;

const CustomTable = styled(EuiBasicTable)`
	margin-bottom: 40px;
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

const BreadRowWrapper = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
`;

const ButtonGroup = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
`;

const EditApproveButton = styled(EuiButton)`
	margin-left: 20px;
`;

const ModalTitle = styled.h1`
	margin: 0;
`;

const ModalContentListWrapper = styled.div``;

const ModalListItem = styled.div`
	padding: 2px 0;
`;

const ListItemTitleCell = styled.span`
	margin-right: 10px;
`;
