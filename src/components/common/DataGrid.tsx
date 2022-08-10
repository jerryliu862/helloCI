import { EuiDataGrid, EuiDataGridColumn, EuiLink, EuiTablePagination } from '@elastic/eui';
import React, { useState, useCallback, useEffect } from 'react';
import DataNotFound from '../common/DataNotFound';

const DataGrid: React.FC<{
	data: any;
	renderCellValue: ({ rowIndex, columnId }) => any;
	pagination: { pageIndex: number; pageSize: number };
	isLoading: boolean;
	total: number;
	dataGridColumns: EuiDataGridColumn[];
	trailingControlColumns: any[];
	setPagination: React.Dispatch<React.SetStateAction<{ pageIndex: number; pageSize: number }>>;
}> = ({
	data,
	renderCellValue,
	pagination,
	isLoading,
	setPagination,
	total,
	dataGridColumns,
	trailingControlColumns,
}) => {
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

	return (
		<div style={{ position: 'relative' }}>
			<EuiDataGrid
				height={600}
				aria-label="Data grid demo"
				columns={dataGridColumns}
				columnVisibility={{ visibleColumns, setVisibleColumns }}
				rowCount={data.length}
				inMemory={{ level: 'sorting' }}
				sorting={{ columns: sortingColumns, onSort }}
				trailingControlColumns={trailingControlColumns}
				renderCellValue={renderCellValue}
			/>
			<div>
				<EuiTablePagination
					pageCount={pageCount}
					activePage={pagination.pageIndex}
					onChangePage={goToPage}
					itemsPerPage={pagination.pageSize}
					onChangeItemsPerPage={changeItemsPerPage}
					itemsPerPageOptions={[10, 20, 50]}
				/>
			</div>
			{!data.length && <DataNotFound />}
		</div>
	);
};
export default DataGrid;
