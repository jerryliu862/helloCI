import { EuiDataGrid, EuiDataGridColumn, EuiLink } from '@elastic/eui';
import React, { useState, useCallback, useEffect } from 'react';
import numberUtil from 'src/util/numberUtil';
import styled from 'styled-components';
import { IRankListItem } from '../../util/utilModel';
import DataNotFound from '../common/DataNotFound';

const dataGridColumns: EuiDataGridColumn[] = [
	{ id: 'name', displayAsText: 'Leaderboard', isResizable: true },
	{ id: 'rank', displayAsText: 'Rank', isResizable: true, initialWidth: 150 },
	{ id: 'score', displayAsText: 'Score', isResizable: true, initialWidth: 150 },
	{ id: 'openID', displayAsText: 'Open ID', isResizable: true },
	{ id: 'userID', displayAsText: 'User ID', isResizable: true },
	{ id: 'userRegion', displayAsText: 'User Region', isResizable: true, initialWidth: 150 },
	{ id: 'fixedBonus', displayAsText: 'Fixed Bonus', isResizable: true, initialWidth: 150 },
	{ id: 'variableBonus', displayAsText: 'Variable Bonus', isResizable: true, initialWidth: 150 },
	{ id: 'totalBonus', displayAsText: 'Total Bonus', isResizable: true, initialWidth: 150 },
];

const DetailDataGrid: React.FC<{ rankList: IRankListItem[]; searchId: string; targetCurrency: any }> = ({
	rankList,
	searchId,
	targetCurrency,
}) => {
	const [visibleColumns, setVisibleColumns] = useState(dataGridColumns.map(({ id }) => id));
	const [detailData, setDetailData] = useState(rankList);

	const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });

	useEffect(() => {
		const filterList = searchId
			? rankList.filter(
					({ openID, userID }) =>
						openID?.toLowerCase().includes(searchId?.toLowerCase()) ||
						userID?.toLowerCase().includes(searchId?.toLowerCase()),
			  )
			: rankList;
		setDetailData(filterList);
	}, [searchId]);

	const onChangeItemsPerPage = useCallback(
		pageSize =>
			setPagination(pagination => ({
				...pagination,
				pageSize,
				pageIndex: 0,
			})),
		[setPagination],
	);
	const onChangePage = useCallback(
		pageIndex => setPagination(pagination => ({ ...pagination, pageIndex })),
		[setPagination],
	);

	const [sortingColumns, setSortingColumns] = useState([]);
	const onSort = useCallback(
		sortingColumns => {
			setSortingColumns(sortingColumns);
		},
		[setSortingColumns],
	);

	const renderCellValue = useCallback(
		({ rowIndex, columnId }) => {
			const cellValue = detailData?.[rowIndex]?.[columnId] ?? null;
			switch (columnId) {
				case 'fixedBonus':
				case 'variableBonus':
				case 'totalBonus':
					return `${targetCurrency?.currencyCode} ${numberUtil.amountFormat(
						cellValue ?? 0,
						targetCurrency?.currencyFormat,
					)}`;
				case 'openID':
				case 'userID':
					const isKeyword = searchId && `${cellValue}`.toLowerCase().includes(searchId?.toLowerCase());
					return <KeywordWrapper isKeyword={isKeyword}> {cellValue}</KeywordWrapper>;
				default:
					return `${cellValue.toLocaleString()}`;
			}
		},
		[detailData],
	);

	return (
		<div style={{ position: 'relative' }}>
			<EuiDataGrid
				aria-label="Data grid demo"
				toolbarVisibility={false}
				columns={dataGridColumns}
				columnVisibility={{ visibleColumns, setVisibleColumns }}
				rowCount={detailData.length}
				inMemory={{ level: 'sorting' }}
				sorting={{ columns: sortingColumns, onSort }}
				height={516}
				pagination={{
					...pagination,
					pageSizeOptions: [15, 50, 100],
					onChangeItemsPerPage: onChangeItemsPerPage,
					onChangePage: onChangePage,
				}}
				renderCellValue={renderCellValue}
			/>
			{!detailData.length && <DataNotFound />}
		</div>
	);
};
export default DetailDataGrid;

const DetailButton = styled(EuiLink)`
	cursor: pointer;
`;

const KeywordWrapper = styled.span<{ isKeyword: boolean }>`
	background-color: ${props => (props.isKeyword ? '#f0d486' : 'none')};
`;
