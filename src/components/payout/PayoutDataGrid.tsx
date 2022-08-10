import { EuiDataGridColumn, EuiLink } from '@elastic/eui';
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { IPayout } from '../../util/utilModel';
import moment from 'moment';
import DataGrid from '../common/DataGrid';
import { AllRegionCurrencyListContext } from 'src/store/AllRegionCurrencyListProvider';
import numberUtil from 'src/util/numberUtil';

const dataGridColumns: EuiDataGridColumn[] = [
	{ id: 'payDate', displayAsText: 'Month', isResizable: true, initialWidth: 150 },
	{ id: 'region', displayAsText: 'Region', isResizable: true, initialWidth: 150 },
	{ id: 'fixedBonus', displayAsText: 'Fixed Bonus', isResizable: true, initialWidth: 150 },
	{ id: 'variableBonus', displayAsText: 'Variable Bonus', isResizable: true, initialWidth: 150 },
	{ id: 'budget', displayAsText: 'Budget', isResizable: true, initialWidth: 150 },
	{ id: 'transportation', displayAsText: 'Transportation', isResizable: true, initialWidth: 150 },
	{ id: 'addon', displayAsText: 'Addon', isResizable: true, initialWidth: 150 },
	{ id: 'deduction', displayAsText: 'Deduction', isResizable: true, initialWidth: 150 },
	{ id: 'total', displayAsText: 'Total', isResizable: true, initialWidth: 150 },
	{ id: 'difference', displayAsText: 'Difference', isResizable: true, initialWidth: 150 },
	{ id: 'status', displayAsText: 'Status', isResizable: true, initialWidth: 150 },
];

const PayoutDataGrid: React.FC<{
	payoutData: IPayout[];
	pagination: { pageIndex: number; pageSize: number };
	isLoading: boolean;
	total: number;
	setPagination: React.Dispatch<React.SetStateAction<{ pageIndex: number; pageSize: number }>>;
}> = ({ payoutData, pagination, isLoading, setPagination, total }) => {
	const { regionCurrencyOptions } = useContext(AllRegionCurrencyListContext);
	const navigate = useNavigate();

	const trailingControlColumns = [
		{
			id: 'action',
			width: 120,
			headerCellRender: () => null,
			rowCellRender: ({ rowIndex }: { rowIndex: number }) => {
				const targetData = payoutData[rowIndex];
				return (
					<DetailButton
						onClick={() => {
							navigate(`/payout/detail/${targetData?.payDate}/${targetData?.region}/${targetData?.id}`);
						}}
					>
						{'Detail'}
					</DetailButton>
				);
			},
		},
	];

	const renderCellValue = ({ rowIndex, columnId }) => {
		let tableData = payoutData?.[rowIndex]?.[columnId] ?? null;
		switch (columnId) {
			case 'payDate':
				tableData = moment(tableData).format('YYYY-MM');
				break;
			case 'status':
				switch (tableData) {
					case 0:
						return 'Ungrouped';
					case 1:
						return 'Grouped';
					case 2:
						return 'Paid';
				}
				break;
			case 'fixedBonus':
			case 'variableBonus':
			case 'budget':
			case 'transportation':
			case 'addon':
			case 'deduction':
			case 'total':
			case 'difference':
				const targetRowData = payoutData[rowIndex];
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
			data={payoutData}
			trailingControlColumns={trailingControlColumns}
			pagination={pagination}
			isLoading={isLoading}
			setPagination={setPagination}
			total={total}
			dataGridColumns={dataGridColumns}
		/>
	);
};
export default PayoutDataGrid;

const DetailButton = styled(EuiLink)`
	cursor: pointer;
`;
