import { EuiPageHeader, EuiPageHeaderSection, EuiTitle } from '@elastic/eui';
import React, { useContext, useEffect, useState } from 'react';

import ReportDataGrid from '../components/report/ReportDataGrid';
import FilterHeader from '../components/common/FilterHeader';
import { GlobalToastContext } from '../store/GlobalToastProvider';
import { IFilterCondition, IReport, IResponse } from '../util/utilModel';
import apiUtil from '../util/apiUtil';
import MarkPaidModal from '../components/report/MarkPaidModal';

const defaultCondition = {
	billingMonth: null,
	selectedRegionOptions: [],
	selectedStatusOptions: [],
};

const Report: React.FC = () => {
	const { handleAlertApiError, setToasts } = useContext(GlobalToastContext);
	const [reportFilterCondition, setReportFilterCondition] = useState<IFilterCondition>(defaultCondition);
	const [isModalVisible, setModalVisible] = useState(false);
	const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });
	const [isLoading, setLoading] = useState(false);
	const [reportData, setReportData] = useState([]);
	const [total, setTotal] = useState(0);
	const [id, setId] = useState(0);

	useEffect(() => {
		fetchReportData();
	}, [pagination]);

	const fetchReportData = async () => {
		const { billingMonth, selectedRegionOptions, selectedStatusOptions } = reportFilterCondition;
		const { pageIndex, pageSize } = pagination;
		const region = selectedRegionOptions?.map(({ label }) => label.toLocaleLowerCase()).join('|');
		const date = billingMonth ? billingMonth.startOf('month').format('YYYY-MM-DD') : '';
		let url = `/report?pageSize=${pageSize}&pageNo=${pageIndex + 1}&date=${date}&region=${region}`;
		if (selectedStatusOptions[0]?.label && selectedStatusOptions[0]?.label !== 'ALL') {
			url = `${url}&status=${selectedStatusOptions[0]?.label === 'Paid'}`;
		}
		setLoading(true);

		try {
			const result: IResponse<IReport[]> = await apiUtil.get(url);
			setTotal(Number(result.headers['x-total-count'] || 0));
			setReportData(result.data);
		} catch (error) {
			handleAlertApiError(error);
		} finally {
			setLoading(false);
		}
	};

	const updatePaidStatus = async () => {
		setLoading(true);
		try {
			const result: IResponse<any[]> = await apiUtil.put(`/payout/${id}/status`, {
				status: true,
			});
			setToasts({
				title: 'Success!',
				color: 'success',
			});
			fetchReportData();
			setModalVisible(false);
		} catch (error) {
			handleAlertApiError(error);
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<EuiPageHeader alignItems="center" bottomBorder>
				<EuiPageHeaderSection>
					<EuiTitle size="l">
						<h1>Report</h1>
					</EuiTitle>
				</EuiPageHeaderSection>
			</EuiPageHeader>
			<FilterHeader
				defaultCondition={defaultCondition}
				filterCondition={reportFilterCondition}
				setFilterCondition={setReportFilterCondition}
				setPagination={setPagination}
			/>
			<ReportDataGrid
				reportData={reportData}
				pagination={pagination}
				isLoading={isLoading}
				setPagination={setPagination}
				total={total}
				setId={setId}
				setModalVisible={setModalVisible}
			/>
			{isModalVisible && <MarkPaidModal setShowMarkModal={setModalVisible} updatePaidStatus={updatePaidStatus} />}
		</>
	);
};

export default Report;
