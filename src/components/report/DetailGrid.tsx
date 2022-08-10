import { EPayType, EReportTabId, IReportDetailData, IReportDetailListItem } from '../../util/utilModel';
import { EuiDataGrid } from '@elastic/eui';
import React, { useState, useCallback, useMemo, useContext } from 'react';
import { AllRegionCurrencyListContext } from 'src/store/AllRegionCurrencyListProvider';
import { useParams } from 'react-router-dom';
import numberUtil from 'src/util/numberUtil';
import styled from 'styled-components';

const columns = [
	{
		id: 'openID',
		displayAsText: 'Open ID',
	},
	{
		id: 'userID',
		displayAsText: 'User ID',
	},

	{
		id: 'streamerRegion',
		displayAsText: 'User Region',
	},
	{
		id: 'payAmount',
		displayAsText: 'Total',
	},
	{
		id: 'taxAmount',
		displayAsText: 'Tax',
	},
	{
		id: 'afterTaxAmount',
		displayAsText: 'After Tax',
	},
	{
		id: 'payType',
		displayAsText: 'Type',
	},
	{
		id: 'bankName',
		displayAsText: 'BK name',
	},
	{
		id: 'bankCode',
		displayAsText: 'BK code',
	},
	{
		id: 'branchName',
		displayAsText: 'BR name',
	},
	{
		id: 'branchCode',
		displayAsText: 'BR code',
	},
	{
		id: 'bankAccount',
		displayAsText: 'BK Account',
	},
	{
		id: 'bankAccountName',
		displayAsText: 'Account name',
	},
	{
		id: 'feeOwnerType',
		displayAsText: 'Owner Type',
	},
	{
		id: 'taxID',
		displayAsText: 'Tax ID',
	},
];

const DetailGrid: React.FC<{
	detailList: IReportDetailListItem[] | [];
	searchText: string;
}> = ({ detailList, searchText }) => {
	const { region } = useParams();
	const { regionCurrencyOptions } = useContext(AllRegionCurrencyListContext);
	const targetCurrency = regionCurrencyOptions.find((item: any) => item.code === region);

	const RenderCellValue = ({ rowIndex, columnId }) => {
		const cellData = detailList?.[rowIndex]?.[columnId] ?? null;
		switch (columnId) {
			case 'openID':
			case 'userID':
			case 'bankAccountName':
				const hasSearchText = searchText && `${cellData}`.toLowerCase().includes(searchText.toLowerCase());
				return <SearchCell isHighLight={hasSearchText}>{cellData}</SearchCell>;
			case 'payType':
				switch (cellData) {
					case EPayType.LOCAL:
						return 'Local';
					case EPayType.FOREIGN:
						return 'Foreign';
					case EPayType.AGENCY:
						return 'Agency';
					default:
						return cellData;
				}
			case 'payAmount':
			case 'taxAmount':
			case 'afterTaxAmount':
				return `${targetCurrency?.currencyCode} ${numberUtil.amountFormat(
					cellData ?? 0,
					targetCurrency?.currencyFormat,
				)}`;
			default:
				return cellData;
		}
	};

	// Column visibility
	const [visibleColumns, setVisibleColumns] = useState(columns.map(({ id }) => id));
	return (
		<EuiDataGrid
			aria-label="Data grid"
			columns={columns}
			toolbarVisibility={false}
			columnVisibility={{ visibleColumns, setVisibleColumns }}
			rowCount={detailList.length}
			renderCellValue={RenderCellValue}
		/>
	);
};

export default DetailGrid;

const SearchCell = styled.span<{ isHighLight: boolean }>`
	background-color: ${props => (props.isHighLight ? '#f0d486' : 'none')};
`;
