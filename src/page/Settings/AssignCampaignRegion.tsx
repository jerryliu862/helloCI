import apiUtil from '../../util/apiUtil';
import {
	EuiButton,
	EuiComboBox,
	EuiDataGrid,
	EuiFlexGroup,
	EuiFlexItem,
	EuiScreenReaderOnly,
	EuiSearchBar,
	EuiSpacer,
	EuiTablePagination,
	EuiTitle,
} from '@elastic/eui';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import DataNotFound from '../../components/common/DataNotFound';
import moment from 'moment';
import { IResponse, RegionTaxList } from '../../util/utilModel';
import LoadingMask from '../../components/common/LoadingMask';
import { GlobalToastContext } from '../../store/GlobalToastProvider';

const columns = [
	{
		id: 'id',
		displayAsText: 'Campaign ID',
	},
	{
		id: 'title',
		displayAsText: 'Campaign Title',
	},
	{
		id: 'startTime',
		displayAsText: 'Start Date',
	},
	{
		id: 'endTime',
		displayAsText: 'End Date',
	},
	{
		id: 'regionList',
		displayAsText: 'Region List',
	},
];

interface IRegionData {
	endTime?: number;
	id?: number;
	regionList?: string;
	startTime?: number;
	title?: string;
}

const AssignCampaignRegion = () => {
	const { handleAlertApiError, setToasts } = useContext(GlobalToastContext);
	const [regionData, setRegionData] = useState<IRegionData[]>([]);
	const [allRegionList, setRegionList] = useState<{ label: string }[]>([]);
	const [total, setTotal] = useState(0);
	const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 15 });
	const [pageCount, setPageCount] = useState(Math.ceil(total / pagination.pageSize));
	const [visibleColumns, setVisibleColumns] = useState(columns.map(({ id }) => id));
	const [selectedRegionOptions, setSelectedRegionOptions] = useState(new Array(pagination.pageSize));
	const [updateRegionData, setUpdateRegionData] = useState([]);
	const [sortingColumns, setSortingColumns] = useState([]);
	const [isLoading, setLoading] = useState(false);

	useEffect(() => {
		fetchRegionListData();
	}, []);

	useEffect(() => {
		setPageCount(Math.ceil(total / pagination.pageSize));
	}, [total]);
	useEffect(() => {
		fetchRegionData();
	}, [pagination]);

	const goToPage = (pageIndex: number) => setPagination(prev => ({ ...prev, pageIndex }));
	const changeItemsPerPage = (pageSize: number) => {
		setPageCount(Math.ceil(total / pageSize));
		setPagination({ pageSize, pageIndex: 0 });
	};

	const fetchRegionListData = async () => {
		try {
			const result: IResponse<RegionTaxList[]> = await apiUtil.get('/region');
			setRegionList(result?.data?.map(({ code }) => ({ label: code })));
		} catch (error) {
			handleAlertApiError(error);
		} finally {
			setLoading(false);
		}
	};

	const fetchRegionData = async () => {
		const { pageIndex, pageSize } = pagination;
		setLoading(true);
		try {
			const result: IResponse<IRegionData[]> = await apiUtil.get(
				`/campaign/noRegion?pageSize=${pageSize}&pageNo=${pageIndex + 1}`,
			);
			setTotal(Number(result.headers['x-total-count'] || 0));
			setRegionData(result.data);
			setSelectedRegionOptions(new Array(pagination.pageSize));
			setUpdateRegionData([]);
		} catch (error) {
			handleAlertApiError(error);
		} finally {
			setLoading(false);
		}
	};

	const upDataRegionData = async () => {
		setLoading(true);
		try {
			const result: IResponse<IRegionData[]> = await apiUtil.put(`campaign/region`, updateRegionData);
			setToasts({
				title: 'Assign campaign region Success!',
				color: 'success',
			});
			fetchRegionData();
		} catch (error) {
			handleAlertApiError(error);
		} finally {
			setLoading(false);
		}
	};

	const onSort = useCallback(
		sortingColumns => {
			setSortingColumns(sortingColumns);
		},
		[setSortingColumns],
	);

	const trailingControlColumns = [
		{
			id: 'action',
			headerCellRender: () => <span style={{ fontSize: 14 }}>Assign Region</span>,
			width: 200,
			rowCellRender: ({ rowIndex }: { rowIndex: number }) => {
				const rowData: string = regionData[rowIndex]?.regionList ?? '';
				const regionList = rowData ? rowData.split(',').map(region => ({ label: region })) : allRegionList;
				return (
					<EuiComboBox
						placeholder="Select"
						options={regionList}
						selectedOptions={selectedRegionOptions[rowIndex]}
						singleSelection={{ asPlainText: true }}
						onChange={(selectedOptions: { label: string }[]) => {
							const newArr = [...selectedRegionOptions];
							newArr[rowIndex] = selectedOptions;
							setSelectedRegionOptions(newArr);
							const newUpdateData = selectedOptions.length
								? updateRegionData.concat({
										id: regionData[rowIndex]?.id,
										region: selectedOptions[0].label,
								  })
								: updateRegionData.filter(data => data.id !== regionData[rowIndex].id);

							setUpdateRegionData(newUpdateData);
						}}
					/>
				);
			},
		},
	];

	return (
		<div>
			<EuiFlexGroup>
				<EuiFlexItem style={{ width: 400 }}>
					<EuiTitle size="l">
						<h1>Assign Campaign Region</h1>
					</EuiTitle>
				</EuiFlexItem>
				<EuiFlexItem grow={false}>
					<EuiButton fill onClick={upDataRegionData}>
						Save
					</EuiButton>
				</EuiFlexItem>
			</EuiFlexGroup>
			<EuiSpacer size="xl" />
			<EuiSpacer />
			<div style={{ position: 'relative' }}>
				<EuiDataGrid
					aria-label="Bonus Data grid"
					columns={columns}
					toolbarVisibility={false}
					columnVisibility={{ visibleColumns, setVisibleColumns }}
					rowCount={regionData.length}
					inMemory={{ level: 'sorting' }}
					sorting={{ columns: sortingColumns, onSort }}
					height={435}
					trailingControlColumns={trailingControlColumns}
					renderCellValue={({ rowIndex, columnId }) => {
						let tableData = regionData?.[rowIndex]?.[columnId] ?? null;
						switch (columnId) {
							case 'startTime':
							case 'endTime':
								tableData = tableData ? moment.unix(tableData).format('YYYY/MM/DD') : '';
								break;
						}
						return tableData;
					}}
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
				{!regionData.length && <DataNotFound />}
				{isLoading && <LoadingMask />}
			</div>
		</div>
	);
};

export default AssignCampaignRegion;
