import { IReportDetailAgencyItem, IReportDetailAgencyStreamer, IReportDetailData } from '../../util/utilModel';
import { EuiBasicTable, EuiButtonIcon, RIGHT_ALIGNMENT } from '@elastic/eui';
import React, { useState, useMemo, useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AllRegionCurrencyListContext } from 'src/store/AllRegionCurrencyListProvider';
import numberUtil from 'src/util/numberUtil';
import styled from 'styled-components';

const AgencyExpandTable: React.FC<{
	detailList: IReportDetailAgencyItem[] | [];
	searchText: string;
}> = ({ detailList, searchText }) => {
	const [sortField, setSortField] = useState<keyof IReportDetailAgencyItem>('agencyName');
	const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
	const [itemIdToExpandedRowMap, setItemIdToExpandedRowMap] = useState({});
	const { region } = useParams();
	const { regionCurrencyOptions } = useContext(AllRegionCurrencyListContext);
	const targetCurrency = regionCurrencyOptions.find((item: any) => item.code === region);

	const agencyColumn: any[] = [
		{
			field: 'agencyName',
			name: 'Agency name',
			sortable: true,
			align: 'center',
			width: '150px',
		},
		{
			field: 'agencyID',
			name: 'Agency ID',
			sortable: true,
			align: 'center',
		},
		{
			field: 'totalAmount',
			name: 'Total',
			sortable: true,
			align: 'center',
			render: (value: number) =>
				`${targetCurrency?.currencyCode} ${numberUtil.amountFormat(
					value ?? 0,
					targetCurrency?.currencyFormat,
				)}`,
		},
		{
			field: 'totalTaxAmount',
			name: 'Tax',
			sortable: true,
			align: 'center',
			render: (value: number) =>
				`${targetCurrency?.currencyCode} ${numberUtil.amountFormat(
					value ?? 0,
					targetCurrency?.currencyFormat,
				)}`,
		},
		{
			field: 'afterTaxAmount',
			name: 'After Tax',
			sortable: true,
			align: 'center',
			render: (value: number) =>
				`${targetCurrency?.currencyCode} ${numberUtil.amountFormat(
					value ?? 0,
					targetCurrency?.currencyFormat,
				)}`,
		},
		{
			field: 'bankName',
			name: 'BK name',
			sortable: true,
			align: 'center',
		},
		{
			field: 'bankCode',
			name: 'BK code',
			sortable: true,
			align: 'center',
		},
		{
			field: 'branchName',
			name: 'BR name',
			sortable: true,
			align: 'center',
		},
		{
			field: 'branchCode',
			name: 'BR code',
			sortable: true,
			align: 'center',
		},
		{
			field: 'bankAccount',
			name: 'BK Account',
			sortable: true,
			align: 'center',
		},
		{
			field: 'bankAccountName',
			name: 'Account name',
			sortable: true,
			align: 'center',
			render: (value: any) => {
				const hasSearchText = searchText && `${value}`.toLowerCase().includes(searchText.toLowerCase());
				return <SearchCell isHighLight={hasSearchText}>{value}</SearchCell>;
			},
		},
		{
			field: 'feeOwnerType',
			name: 'Owner Type',
			sortable: true,
			align: 'center',
		},
		{
			field: 'taxID',
			name: 'Tax ID',
			sortable: true,
			align: 'center',
		},
		{
			align: RIGHT_ALIGNMENT,
			width: '40px',
			isExpander: true,
			render: (item: any) => (
				<EuiButtonIcon
					onClick={() => toggleDetails(item)}
					aria-label={itemIdToExpandedRowMap[item.agencyID] ? 'Collapse' : 'Expand'}
					iconType={itemIdToExpandedRowMap[item.agencyID] ? 'arrowUp' : 'arrowDown'}
				/>
			),
		},
	];

	const toggleDetails = (item: IReportDetailAgencyItem) => {
		const itemIdToExpandedRowMapValues = { ...itemIdToExpandedRowMap };
		if (itemIdToExpandedRowMapValues[item.agencyID]) {
			delete itemIdToExpandedRowMapValues[item.agencyID];
		} else {
			itemIdToExpandedRowMapValues[item.agencyID] = (
				<InnerTable streamerList={item?.streamerList} searchText={searchText} />
			);
		}
		setItemIdToExpandedRowMap(itemIdToExpandedRowMapValues);
	};

	const onTableChange = ({
		sort = { field: 'agencyName', direction: 'asc' },
	}: {
		sort: { field: keyof IReportDetailAgencyItem; direction: 'asc' | 'desc' };
	}) => {
		const { field: sortField, direction: sortDirection } = sort;
		setSortField(sortField);
		setSortDirection(sortDirection);
	};

	const sorting = {
		sort: {
			field: sortField,
			direction: sortDirection,
		},
	};

	useEffect(() => {
		setItemIdToExpandedRowMap({});
	}, [searchText]);

	return (
		<EuiBasicTable
			tableCaption="Agency of EuiBasicTable with expanding rows"
			items={detailList}
			itemId="agencyID"
			itemIdToExpandedRowMap={itemIdToExpandedRowMap}
			isExpandable={true}
			hasActions={true}
			columns={agencyColumn}
			sorting={sorting}
			isSelectable={false}
			onChange={onTableChange}
		/>
	);
};

export default AgencyExpandTable;

const InnerTable: React.FC<{ streamerList: IReportDetailAgencyStreamer[]; searchText: string }> = ({
	streamerList = [],
	searchText,
}) => {
	const { region } = useParams();
	const { regionCurrencyOptions } = useContext(AllRegionCurrencyListContext);
	const targetCurrency = regionCurrencyOptions.find((item: any) => item.code === region);
	const streamerListColumns = [
		{
			field: 'openID',
			name: 'Open ID',
			render: (value: any) => {
				const hasSearchText = searchText && `${value}`.toLowerCase().includes(searchText.toLowerCase());
				return <SearchCell isHighLight={hasSearchText}>{value}</SearchCell>;
			},
		},
		{
			field: 'userID',
			name: 'User ID',
			render: (value: any) => {
				const hasSearchText = searchText && `${value}`.toLowerCase().includes(searchText.toLowerCase());
				return <SearchCell isHighLight={hasSearchText}>{value}</SearchCell>;
			},
		},
		{
			field: 'streamerRegion',
			name: 'Region',
		},
		{
			field: 'payAmount',
			name: 'Total',
			render: (value: number) =>
				`${targetCurrency?.currencyCode} ${numberUtil.amountFormat(
					value ?? 0,
					targetCurrency?.currencyFormat,
				)}`,
		},
		{
			field: 'campaignTitle',
			name: 'Campaign title',
		},
	];

	return (
		<EuiBasicTable
			tableCaption="Agency of EuiBasicTable with expanding rows"
			items={streamerList}
			itemId="userID"
			columns={streamerListColumns}
		/>
	);
};

const SearchCell = styled.span<{ isHighLight: boolean }>`
	background-color: ${props => (props.isHighLight ? '#f0d486' : 'none')};
`;
