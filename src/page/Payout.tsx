import { EuiPageHeader, EuiPageHeaderSection, EuiTitle, EuiButton } from '@elastic/eui';
import moment from 'moment';
import React, { useContext, useEffect, useState } from 'react';
import AddAdjustmentModal from '../components/payout/AddAdjustmentModal';
import PayoutDataGrid from '../components/payout/PayoutDataGrid';
import { IPayout, IFilterCondition, IResponse } from '../util/utilModel';
import apiUtil from '../util/apiUtil';
import { useSearchParams } from 'react-router-dom';
import { GlobalToastContext } from '../store/GlobalToastProvider';
import LoadingMask from '../components/common/LoadingMask';
import FilterHeader from '../components/common/FilterHeader';
import { AllRegionCurrencyListContext } from 'src/store/AllRegionCurrencyListProvider';

const options = [
	{
		label: 'ALL',
	},
	{
		label: 'Grouped',
	},
	{
		label: 'Ungrouped',
	},
	{
		label: 'Paid',
	},
];

const Payout = () => {
	const { regionCurrencyOptions } = useContext(AllRegionCurrencyListContext);
	const { handleAlertApiError } = useContext(GlobalToastContext);
	const defaultCondition = {
		billingMonth: null,
		selectedRegionOptions: [],
		selectedStatusOptions: [{ label: 'ALL' }],
	};
	const [payoutFilterCondition, setPayoutFilterCondition] = useState<IFilterCondition>(defaultCondition);

	const [isShowAdjustmentModal, setIsShowAdjustmentModal] = useState(false);
	const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });
	const [payoutData, setPayOutData] = useState<IPayout[]>([]);
	const [isLoading, setLoading] = useState(false);
	const [regionCode, setRegionCode] = useState('');
	const [total, setTotal] = useState(0);
	const targetCurrency = regionCurrencyOptions.find((item: any) => item.currencyCode === regionCode);
	useEffect(() => {
		fetchPayoutData();
	}, [pagination]);

	useEffect(() => {
		setRegionCode('');
	}, [isShowAdjustmentModal]);

	const fetchPayoutData = async () => {
		const { billingMonth, selectedRegionOptions, selectedStatusOptions } = payoutFilterCondition;
		const { pageIndex, pageSize } = pagination;
		const region = selectedRegionOptions?.map(({ label }) => label.toLocaleLowerCase()).join('|');
		const date = billingMonth ? billingMonth.startOf('month').format('YYYY-MM-DD') : '';
		let url = `/payout?pageSize=${pageSize}&pageNo=${pageIndex + 1}&date=${date}&region=${region}`;
		if (selectedStatusOptions[0].label && selectedStatusOptions[0].label !== 'ALL') {
			url = `${url}&isGrouped=${selectedStatusOptions[0]?.label === 'Grouped'}`;
		}
		if (selectedStatusOptions[0].label && !['Ungrouped', 'ALL'].includes(selectedStatusOptions[0].label)) {
			url = `${url}&isPaid=${selectedStatusOptions[0]?.label === 'Paid'}`;
		}

		setLoading(true);

		try {
			const result: IResponse<IPayout[]> = await apiUtil.get(url);
			setTotal(Number(result.headers['x-total-count'] || 0));
			setPayOutData(result.data);
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
						<h1>Payout</h1>
					</EuiTitle>
				</EuiPageHeaderSection>
				<EuiButton
					fill
					size="s"
					onClick={() => {
						setIsShowAdjustmentModal(true);
					}}
				>
					Add Adjustment
				</EuiButton>
			</EuiPageHeader>
			<FilterHeader
				defaultCondition={defaultCondition}
				options={options}
				filterCondition={payoutFilterCondition}
				setFilterCondition={setPayoutFilterCondition}
				setPagination={setPagination}
			/>
			<PayoutDataGrid
				payoutData={payoutData}
				pagination={pagination}
				isLoading={isLoading}
				setPagination={setPagination}
				total={total}
			/>
			{isShowAdjustmentModal && (
				<AddAdjustmentModal
					setIsShowAdjustmentModal={setIsShowAdjustmentModal}
					setRegionCode={setRegionCode}
					targetCurrency={targetCurrency}
				/>
			)}
			{isLoading && <LoadingMask />}
		</div>
	);
};

export default Payout;
