import React, { useState, useEffect, useContext } from 'react';

import { EuiButton, EuiPageHeader, EuiPageHeaderSection, EuiTitle } from '@elastic/eui';
import BonusFilterHeader from '../components/bonus/BonusFilterHeader';
import BonusDataGrid from '../components/bonus/BonusDataGrid';
import { IBonusFilterCondition, ICampaignDetailData, IResponse } from '../util/utilModel';
import apiUtil from '../util/apiUtil';
import { GlobalToastContext } from '../store/GlobalToastProvider';
import styled from 'styled-components';
import LoadingMask from '../components/common/LoadingMask';

const Bonus = () => {
	const { setToasts, handleAlertApiError } = useContext(GlobalToastContext);
	const [filterCondition, setFilterCondition] = useState<IBonusFilterCondition>({
		campaignEndDate: null,
		selectedRegionOptions: [],
		selectedStatusOptions: [{ label: 'ALL' }],
		isCheckBonusZero: false,
		searchText: '',
	});

	const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });
	const [campaignData, setCampaignData] = useState<ICampaignDetailData[]>([]);
	const [isLoading, setLoading] = useState(false);
	const [total, setTotal] = useState(0);

	useEffect(() => {
		fetchCampaignData();
	}, [pagination]);

	const fetchCampaignData = async () => {
		const { campaignEndDate, selectedRegionOptions, selectedStatusOptions, isCheckBonusZero, searchText } =
			filterCondition;
		const { pageIndex, pageSize } = pagination;
		const region = selectedRegionOptions?.map(({ label }) => label.toLocaleLowerCase()).join('|');
		const approval = selectedStatusOptions[0].label === 'ALL' ? '' : selectedStatusOptions[0]?.label === 'Approved';
		setLoading(true);
		let url = `/campaign?pageSize=${pageSize}&pageNo=${
			pageIndex + 1
		}&region=${region}&approval=${approval}&keyword=${searchText}`;
		if (campaignEndDate) {
			url = `${url}&date=${campaignEndDate.startOf('month').format('YYYY-MM-DD')}`;
		}
		if (isCheckBonusZero) {
			url = `${url}&isZero=true`;
		}
		try {
			const result: IResponse<ICampaignDetailData[]> = await apiUtil.get(url);
			setTotal(Number(result.headers['x-total-count'] || 0));
			setCampaignData(result.data);
		} catch (error) {
			handleAlertApiError(error);
		} finally {
			setLoading(false);
		}
	};

	const syncDatabase = async () => {
		setLoading(true);
		try {
			const result = await apiUtil.get(`/sync`);
			result.status === 200 &&
				setToasts({
					title: `Sync data Success!`,
					color: 'success',
				});
			result.status === 202 &&
				setToasts({
					title: `Sync in progress`,
					color: 'success',
				});
			await fetchCampaignData();
		} catch (error) {
			handleAlertApiError(error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div>
			<EuiPageHeader alignItems="center" bottomBorder>
				<EuiPageHeaderSection>
					<EuiTitle size="l">
						<h1>Bonus</h1>
					</EuiTitle>
				</EuiPageHeaderSection>
				<ButtonGroup>
					<RefreshButton fill size="s" onClick={() => syncDatabase()}>
						Refresh
					</RefreshButton>
				</ButtonGroup>
			</EuiPageHeader>
			<BonusFilterHeader
				filterCondition={filterCondition}
				setFilterCondition={setFilterCondition}
				setPagination={setPagination}
			/>
			<BonusDataGrid
				keyword={filterCondition.searchText}
				total={total}
				campaignData={campaignData}
				pagination={pagination}
				isLoading={isLoading}
				setPagination={setPagination}
			/>
			{isLoading ? <LoadingMask /> : <></>}
		</div>
	);
};

export default Bonus;

const ButtonGroup = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-between;
`;

const RefreshButton = styled(EuiButton)`
	margin-left: 20px;
`;
