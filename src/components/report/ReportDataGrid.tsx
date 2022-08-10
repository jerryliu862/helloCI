import { EuiDataGridColumn, EuiIcon, EuiLink, EuiButton } from '@elastic/eui';
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { IPayout } from '../../util/utilModel';
import moment from 'moment';
import DataGrid from '../common/DataGrid';

import { AllRegionCurrencyListContext } from 'src/store/AllRegionCurrencyListProvider';
import numberUtil from 'src/util/numberUtil';
import { downloadCsv } from 'src/util/downloadExcel';

const dataGridColumns: EuiDataGridColumn[] = [
	{ id: 'payDate', displayAsText: 'Month', isResizable: true, initialWidth: 150 },
	{ id: 'region', displayAsText: 'Region', isResizable: true, initialWidth: 150 },
	{ id: 'foreignAmount', displayAsText: 'Foreign', isResizable: true, initialWidth: 150 },
	{ id: 'agencyAmount', displayAsText: 'Agency', isResizable: true, initialWidth: 150 },
	{ id: 'localAmount', displayAsText: 'Local', isResizable: true, initialWidth: 150 },
	{ id: 'streamerCount', displayAsText: 'Number', isResizable: true, initialWidth: 150 },
	{ id: 'missingCount', displayAsText: 'Missing', isResizable: true, initialWidth: 150 },
	{ id: 'totalAmount', displayAsText: 'Total', isResizable: true, initialWidth: 150 },
	{ id: 'totalTaxAmount', displayAsText: 'Tax', isResizable: true, initialWidth: 150 },
	{ id: 'afterTaxAmount', displayAsText: 'After Tax', isResizable: true, initialWidth: 150 },
	{ id: 'status', displayAsText: 'Payment', isResizable: true, initialWidth: 150 },
];

const ReportDataGrid: React.FC<{
	reportData: IPayout[];
	pagination: { pageIndex: number; pageSize: number };
	isLoading: boolean;
	total: number;
	setId: React.Dispatch<React.SetStateAction<number>>;
	setModalVisible: React.Dispatch<React.SetStateAction<boolean>>;
	setPagination: React.Dispatch<React.SetStateAction<{ pageIndex: number; pageSize: number }>>;
}> = ({ reportData, pagination, isLoading, setPagination, total, setModalVisible, setId }) => {
	const { regionCurrencyOptions } = useContext(AllRegionCurrencyListContext);
	const navigate = useNavigate();

	const trailingControlColumns = [
		{
			id: 'download',
			width: 120,
			headerCellRender: () => <h5>Download</h5>,
			rowCellRender: ({ rowIndex }: { rowIndex: number }) => {
				const targetData = reportData[rowIndex];
				return (
					<span
						onClick={() => {
							downloadCsv(targetData?.id);
						}}
					>
						<EuiIcon type="download" />
					</span>
				);
			},
		},
		{
			id: 'detail',
			width: 120,
			headerCellRender: () => null,
			rowCellRender: ({ rowIndex }: { rowIndex: number }) => {
				const targetData = reportData[rowIndex];
				return (
					<DetailButton
						onClick={() => {
							navigate(`/report/${targetData.payDate}/${targetData.region}/${targetData?.id}`);
						}}
					>
						Detail
					</DetailButton>
				);
			},
		},
	];

	const renderCellValue = ({ rowIndex, columnId, setCellProps }) => {
		let tableData = reportData?.[rowIndex]?.[columnId] ?? null;
		const targetRowData = reportData[rowIndex];
		switch (columnId) {
			case 'missingCount':
				setCellProps({
					style: {
						backgroundColor: tableData > 0 ? 'red' : 'none',
					},
				});
				break;
			case 'payDate':
				tableData = moment(tableData).format('YYYY-MM');
				break;
			case 'status':
				tableData = (
					<MaskAsPaidButton
						onClick={() => {
							setId(reportData[rowIndex].id);
							setModalVisible(true);
						}}
						disabled={tableData}
					>
						{tableData ? 'Paid' : 'Mask as Paid'}
					</MaskAsPaidButton>
				);
				break;
			case 'foreignAmount':
			case 'agencyAmount':
			case 'localAmount':
			case 'totalAmount':
			case 'totalTaxAmount':
			case 'afterTaxAmount':
				const targetCurrency = regionCurrencyOptions.find((item: any) => item.code === targetRowData.region);
				tableData = `${targetCurrency?.currencyCode} ${numberUtil.amountFormat(
					tableData ?? 0,
					targetCurrency?.currencyFormat,
				)}`;
				break;
			default:
				tableData = tableData?.toLocaleString() ?? 0;
				break;
		}
		return tableData;
	};

	return (
		<DataGrid
			renderCellValue={renderCellValue}
			data={reportData}
			trailingControlColumns={trailingControlColumns}
			pagination={pagination}
			isLoading={isLoading}
			setPagination={setPagination}
			total={total}
			dataGridColumns={dataGridColumns}
		/>
	);
};
export default ReportDataGrid;

const DetailButton = styled(EuiLink)`
	cursor: pointer;
`;

const MaskAsPaidButton = styled(EuiButton)`
	height: 28px;
	font-size: 14px;
`;
