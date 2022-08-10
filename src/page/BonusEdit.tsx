import {
	EuiBreadcrumbs,
	EuiButton,
	EuiPageHeader,
	EuiPageHeaderSection,
	EuiTitle,
	EuiTabbedContent,
	EuiSpacer,
	EuiFieldText,
	EuiButtonIcon,
} from '@elastic/eui';
import moment from 'moment';
import React, { Fragment, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AllRegionCurrencyListContext } from 'src/store/AllRegionCurrencyListProvider';
import styled from 'styled-components';
import { theme } from 'styled-tools';
import EditDataTable from '../components/bonus/EditDataTable';
import LoadingMask from '../components/common/LoadingMask';
import NumberFormatInput from '../components/common/NumberFormatInput';
import DataInfo from '../components/DataInfo';
import { GlobalToastContext } from '../store/GlobalToastProvider';
import apiUtil from '../util/apiUtil';
import numberUtil from '../util/numberUtil';
import { IAdjustLeaderboardItem, ICampaignDetailData, ILeaderboardItem } from '../util/utilModel';

const initialCampaignDetailData: ICampaignDetailData = {
	approvalStatus: false,
	approvalTime: null,
	approverName: null,
	bonusDiff: 0,
	budget: 0,
	endTime: 0,
	id: 0,
	leaderboardList: [],
	region: '',
	remark: null,
	startTime: 0,
	title: '',
	totalBonus: 0,
	syncTime: '',
};

const timeFormat = (value: any) => (value ? moment.unix(value).format('YYYY-MM-DD') : '--');

const BonusEdit: React.FC = () => {
	const { regionCurrencyOptions } = useContext(AllRegionCurrencyListContext);
	const { setToasts, handleAlertApiError } = useContext(GlobalToastContext);
	const { campaignId = 0 } = useParams();
	const navigate = useNavigate();
	const [campaignDetailData, setCampaignDetailData] = useState<ICampaignDetailData>(initialCampaignDetailData);
	const [isLoading, setIsLoading] = useState(false);
	const [adjustLeaderboardData, setAdjustLeaderboardData] = useState<IAdjustLeaderboardItem[] | []>([]);
	const [editTotalBonusDiff, setEditTotalBonusDiff] = useState(0);
	const [tabScrollDistance, seTabScrollDistance] = useState(0);
	const displayTotalBonus = campaignDetailData.totalBonus + editTotalBonusDiff;
	const displayBonusDiff = campaignDetailData.budget
		? Number(campaignDetailData.budget) - displayTotalBonus
		: 0 - displayTotalBonus;
	const targetCurrency = regionCurrencyOptions.find((item: any) => item.code === campaignDetailData.region);

	const fetchCampaignDetail = useCallback(async () => {
		setIsLoading(true);
		try {
			const result = await apiUtil.get(`/campaign/${campaignId}`);
			setCampaignDetailData(result?.data);
		} catch (error) {
			handleAlertApiError(error);
		} finally {
			setIsLoading(false);
		}
	}, []);

	const handleSaveEdit = async () => {
		setIsLoading(true);
		try {
			const result = await apiUtil.put(`/campaign/${campaignId}/bonus`, {
				campaignID: Number(campaignId),
				budget: Number(campaignDetailData.budget),
				remark: campaignDetailData.remark,
				leaderboardList: adjustLeaderboardData.length ? [...adjustLeaderboardData] : [],
			});
			setIsLoading(false);
			if (result.status === 200) {
				setToasts({
					title: `Update Bonus Data Success!`,
					color: 'success',
				});
				navigate(`/bonus/detail/${campaignId}`);
			}
		} catch (error) {
			setIsLoading(false);
			handleAlertApiError(error);
		}
	};

	useEffect(() => {
		fetchCampaignDetail();
	}, []);

	const breadcrumbs = [
		{
			text: 'Bonus',
			href: '#',
			onClick: (e: any) => {
				e.preventDefault();
				navigate('/bonus');
			},
		},
		{
			text: `ID:${campaignId}`,
			href: '#',
			onClick: (e: any) => {
				e.preventDefault();
				navigate(`/bonus/detail/${campaignId}`);
			},
		},
		{
			text: `edit`,
		},
	];

	const infoData = useMemo(
		() => [
			{ title: 'Campaign ID', value: `${campaignDetailData.id ?? '--'}` },
			{
				title: 'Start Date',
				value: timeFormat(campaignDetailData.startTime),
			},
			{ title: 'Campaign Title', value: campaignDetailData.title ?? '--' },
			{
				title: 'End Date',
				value: timeFormat(campaignDetailData.endTime),
			},
			{ title: 'Region', value: campaignDetailData.region },
			{
				title: 'Remark',
				value: (
					<EuiFieldText
						name="remark"
						placeholder="Remark"
						value={campaignDetailData.remark ?? ''}
						onChange={(e: any) =>
							setCampaignDetailData(prev => ({ ...prev, remark: e.target.value.trim() }))
						}
						disabled={campaignDetailData.approvalStatus}
					/>
				),
			},
		],
		[campaignDetailData, targetCurrency],
	);

	// 只有 budget、remark 會被寫原資料
	const infoData2 = useMemo(
		() => [
			{
				title: 'Budget',
				value: (
					<NumberFormatInput
						targetCurrency={targetCurrency}
						disabled={campaignDetailData.approvalStatus}
						handleValueChange={(value: string) =>
							setCampaignDetailData(prev => ({
								...prev,
								budget: value,
							}))
						}
						tableValue={`${campaignDetailData.budget ?? 0}`}
					/>
				),
			},
			{
				title: 'Total Bonus',
				value: `${targetCurrency?.currencyCode} ${numberUtil.amountFormat(
					displayTotalBonus,
					targetCurrency?.currencyFormat,
				)}`,
			},
			{
				title: 'Difference',
				value: `${targetCurrency?.currencyCode} ${numberUtil.amountFormat(
					displayBonusDiff,
					targetCurrency?.currencyFormat,
				)}`,
			},
		],
		[campaignDetailData, displayTotalBonus, targetCurrency],
	);

	const tabs = campaignDetailData.leaderboardList.map((item: ILeaderboardItem) => ({
		id: `id-${item?.leaderboardID}`,
		name: item?.name,
		content: (
			<Fragment key={item?.leaderboardID}>
				<EuiSpacer />
				<EditDataTable
					rankList={item?.rankList ?? []}
					leaderboardID={item?.leaderboardID}
					adjustData={adjustLeaderboardData}
					setAdjustData={setAdjustLeaderboardData}
					setEditTotalBonusDiff={setEditTotalBonusDiff}
					isApproved={campaignDetailData.approvalStatus}
					targetCurrency={targetCurrency}
				/>
			</Fragment>
		),
	}));

	return (
		<div>
			<EuiPageHeader alignItems="center" bottomBorder>
				<EuiPageHeaderSection>
					<EuiTitle size="l">
						<h1>Edit Bonus</h1>
					</EuiTitle>
				</EuiPageHeaderSection>
			</EuiPageHeader>
			<BreadRowWrapper>
				<CustomBread breadcrumbs={breadcrumbs} truncate={false} />
				{campaignDetailData.approvalStatus ? (
					<></>
				) : (
					<ButtonGroup>
						<EditApproveButton fill size="s" onClick={handleSaveEdit}>
							Save
						</EditApproveButton>
					</ButtonGroup>
				)}
			</BreadRowWrapper>
			<PanelWrapper>
				<div>
					<DataInfo infoData={infoData} />
				</div>
				<div>
					<DataInfo infoData={infoData2} groupCountInOneRow={1} />
				</div>
			</PanelWrapper>
			{campaignDetailData.leaderboardList.length ? (
				<>
					<ScrollButtonsWrapper>
						<EuiButtonIcon
							display="fill"
							iconType="arrowLeft"
							aria-label="Last"
							onClick={() => {
								const tabElement = document.getElementsByClassName('euiTabs')?.[0];
								if (!tabElement) return;
								tabElement.scrollLeft -= 400;
							}}
						/>
						<EuiButtonIcon
							display="fill"
							iconType="arrowRight"
							aria-label="Next"
							onClick={() => {
								const tabElement = document.getElementsByClassName('euiTabs')?.[0];
								if (!tabElement) return;
								tabElement.scrollLeft += 400;
							}}
						/>
					</ScrollButtonsWrapper>
					<EuiTabbedContent tabs={tabs} initialSelectedTab={tabs[0]} />
				</>
			) : (
				<></>
			)}

			{isLoading ? <LoadingMask /> : <></>}
		</div>
	);
};

export default BonusEdit;

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

const CustomBread = styled(EuiBreadcrumbs)`
	margin: 20px 0;
	.euiLink.euiLink--subdued {
		color: ${theme('colors.customColorPrimary')};
	}
`;

const PanelWrapper = styled.div`
	display: flex;
	justify-content: space-between;
	margin: 10px 0 40px;
	> :first-child {
		margin-right: 20px;
	}
	> :nth-child(2) {
		width: 60%;
	}
`;

const ScrollButtonsWrapper = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
`;
