import { ICampaignDetailData } from 'src/util/utilModel';
import { EuiDataGrid, EuiLoadingSpinner, EuiLink, EuiTablePagination } from '@elastic/eui';
import moment from 'moment';
import React, { useState, useCallback, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import DataNotFound from '../common/DataNotFound';
import { AllRegionCurrencyListContext } from 'src/store/AllRegionCurrencyListProvider';
import numberUtil from 'src/util/numberUtil';

const dataGridColumns = [
	{ id: 'id', displayAsText: 'Campaign ID' },
	{ id: 'title', displayAsText: 'Campaign Title' },
	{ id: 'region', displayAsText: 'Region', isResizable: true, initialWidth: 150 },
	{ id: 'startTime', displayAsText: 'Start Date', isResizable: true, initialWidth: 150 },
	{ id: 'endTime', displayAsText: 'End Date', isResizable: true, initialWidth: 150 },
	{ id: 'budget', displayAsText: 'Budget', isResizable: true, initialWidth: 150 },
	{ id: 'totalBonus', displayAsText: 'Total Bonus', isResizable: true, initialWidth: 150 },
	{ id: 'approvalStatus', displayAsText: 'Approval', isResizable: true, initialWidth: 150 },
	{ id: 'approvalTime', displayAsText: 'Approval Time', isResizable: true, initialWidth: 150 },
	{ id: 'remark', displayAsText: 'Remark', isResizable: true, initialWidth: 150 },
];

const BonusDataGrid: React.FC<{
	keyword: string;
	campaignData: ICampaignDetailData[];
	pagination: { pageIndex: number; pageSize: number };
	isLoading: boolean;
	total: number;
	setPagination: React.Dispatch<React.SetStateAction<{ pageIndex: number; pageSize: number }>>;
}> = ({ keyword, campaignData, pagination, isLoading, setPagination, total }) => {
	const { regionCurrencyOptions } = useContext(AllRegionCurrencyListContext);
	const navigate = useNavigate();
	const [visibleColumns, setVisibleColumns] = useState(dataGridColumns.map(({ id }) => id));
	const [pageCount, setPageCount] = useState(Math.ceil(total / pagination.pageSize));

	useEffect(() => {
		setPageCount(Math.ceil(total / pagination.pageSize));
	}, [total]);

	const goToPage = (pageIndex: number) => setPagination(prev => ({ ...prev, pageIndex }));
	const changeItemsPerPage = (pageSize: number) => {
		setPageCount(Math.ceil(total / pageSize));
		setPagination(prev => ({ pageSize, pageIndex: 0 }));
	};

	const [sortingColumns, setSortingColumns] = useState([]);
	const onSort = useCallback(
		sortingColumns => {
			setSortingColumns(sortingColumns);
		},
		[setSortingColumns],
	);

	const trailingControlColumns = [
		{
			id: 'action',
			width: 120,
			headerCellRender: () => null,
			rowCellRender: ({ rowIndex }: { rowIndex: number }) => (
				<DetailButton
					onClick={() => {
						navigate(`/bonus/detail/${campaignData[rowIndex]?.id}`);
					}}
				>
					Detail
				</DetailButton>
			),
		},
	];

	const renderCellFun = useCallback(
		({ rowIndex, columnId, setCellProps }) => {
			let tableData = campaignData?.[rowIndex]?.[columnId] ?? null;
			const targetRowData = campaignData?.[rowIndex] ?? null;
			switch (columnId) {
				case 'id':
				case 'title':
					const isKeyword = keyword && `${tableData}`.toLowerCase().includes(keyword?.toLowerCase());
					return <KeywordWrapper isKeyword={isKeyword}> {tableData}</KeywordWrapper>;
				case 'startTime':
				case 'endTime':
					tableData = tableData ? moment.unix(tableData).format('YYYY-MM-DD') : '';
					break;
				case 'approvalTime':
					tableData = tableData ? moment(tableData).format('YYYY-MM-DD') : '';
					break;
				case 'approvalStatus':
					tableData = tableData ? 'Approved' : 'Waiting';
					break;
				case 'budget':
				case 'totalBonus':
					const targetCurrency = regionCurrencyOptions.find(
						(item: any) => item.code === targetRowData.region,
					);
					tableData = `${targetCurrency?.currencyCode} ${numberUtil.amountFormat(
						tableData ?? 0,
						targetCurrency?.currencyFormat,
					)}`;
					break;
			}
			return tableData;
		},
		[campaignData],
	);

	if (isLoading) {
		return <EuiLoadingSpinner />;
	}

	return (
		<div style={{ position: 'relative' }}>
			<EuiDataGrid
				aria-label="Bonus Data grid"
				columns={dataGridColumns}
				columnVisibility={{ visibleColumns, setVisibleColumns }}
				rowCount={campaignData.length}
				inMemory={{ level: 'sorting' }}
				sorting={{ columns: sortingColumns, onSort }}
				height={480}
				trailingControlColumns={trailingControlColumns}
				renderCellValue={renderCellFun}
			/>
			<div>
				<EuiTablePagination
					pageCount={pageCount}
					activePage={pagination.pageIndex}
					onChangePage={goToPage}
					itemsPerPage={pagination.pageSize}
					onChangeItemsPerPage={changeItemsPerPage}
					itemsPerPageOptions={[15, 20, 50]}
				/>
			</div>
			{!campaignData.length && <DataNotFound />}
		</div>
	);
};
export default BonusDataGrid;

const DetailButton = styled(EuiLink)`
	cursor: pointer;
`;
const KeywordWrapper = styled.span<{ isKeyword: boolean }>`
	background-color: ${props => (props.isKeyword ? '#f0d486' : 'none')};
`;
