import React, { useCallback, useState, useEffect, useMemo } from 'react';
import {
	EuiButton,
	EuiButtonEmpty,
	EuiContextMenuItem,
	EuiContextMenuPanel,
	EuiDataGrid,
	EuiFlexGroup,
	EuiFlexItem,
	EuiIcon,
	EuiLink,
	EuiPagination,
	EuiPopover,
	EuiSpacer,
	EuiTitle,
} from '@elastic/eui';
import apiUtil from '../../util/apiUtil';
import { UserList } from 'src/util/utilModel';
import { useNavigate } from 'react-router-dom';
import LoadingMask from '../../components/common/LoadingMask';

const columns = [
	{
		id: 'name',
		displayAsText: 'User Name',
	},
	{
		id: 'email',
		displayAsText: 'User Email',
	},
	{
		id: 'editPermissions',
		displayAsText: 'Edit Permissions',
	},
];

const Permissions: React.FC = () => {
	const navigator = useNavigate();
	const [isLoading, setIsLoading] = useState(false);
	const [userList, setUserList] = useState<UserList[]>([]);
	const [isPopoverOpen, setIsPopoverOpen] = useState(false);
	const [visibleColumns, setVisibleColumns] = useState(
		columns.map(({ id }) => id), // initialize to the full set of columns
	);
	const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10, totalPage: 1 });

	useEffect(() => {
		fetchUserList();
	}, [pagination.pageIndex, pagination.pageSize]);

	const fetchUserList = useCallback(async () => {
		setIsLoading(true);
		try {
			const result = await apiUtil.get('/user', {
				params: { pageSize: pagination.pageSize ?? 10, pageNo: pagination.pageIndex + 1 },
			});
			const userTableData = result?.data?.map((user: any) => ({
				...user,
				editPermissions: (
					<EuiLink href={`/settings/permissions/edit/${user.uid}`}>
						<EuiIcon type="pencil" />
					</EuiLink>
				),
			}));
			const totalDataLength = Number(result.headers['x-total-count']) ?? 0;
			setPagination(prev => ({
				...prev,
				totalPage:
					totalDataLength % pagination.pageSize === 0
						? Math.floor(totalDataLength / pagination.pageSize)
						: Math.floor(totalDataLength / pagination.pageSize) + 1,
			}));
			setUserList(userTableData);
		} catch (error) {
			console.error('error:', error);
		} finally {
			setIsLoading(false);
		}
	}, [pagination.pageIndex, pagination.pageSize]);

	const onChangePage = useCallback(
		pageIndex => setPagination(pagination => ({ ...pagination, pageIndex })),
		[setPagination],
	);

	const renderCellValue = useCallback(
		({ rowIndex, columnId }) => {
			return userList?.[rowIndex]?.[columnId] ?? null;
		},
		[userList],
	);

	const closePopover = useCallback(() => setIsPopoverOpen(false), [setIsPopoverOpen]);

	const popoverButton = useMemo(
		() => (
			<EuiButtonEmpty
				size="xs"
				color="text"
				iconType="arrowDown"
				iconSide="right"
				onClick={() => setIsPopoverOpen(!isPopoverOpen)}
			>
				Rows per page: {pagination.pageSize}
			</EuiButtonEmpty>
		),
		[pagination, isPopoverOpen],
	);

	const pageSizeItemComponents = [10, 50, 100].map((size: number) => (
		<EuiContextMenuItem
			key={`${size}-row`}
			icon={size === pagination.pageSize ? 'check' : 'empty'}
			onClick={() => {
				closePopover();
				setPagination(prev => ({ ...prev, pageSize: size, pageIndex: 0 }));
			}}
		>
			{`${size} rows`}
		</EuiContextMenuItem>
	));

	return (
		<>
			<EuiFlexGroup>
				<EuiFlexItem>
					<EuiTitle size="l">
						<h1>Permission Settings</h1>
					</EuiTitle>
				</EuiFlexItem>
				<EuiFlexItem grow={false}>
					<EuiButton onClick={() => navigator('/settings/permissions/edit/add')}>Add</EuiButton>
				</EuiFlexItem>
			</EuiFlexGroup>
			<EuiSpacer />
			<EuiDataGrid
				aria-label="Permission Settings Data grid"
				toolbarVisibility={false}
				columns={columns}
				columnVisibility={{ visibleColumns, setVisibleColumns }}
				rowCount={userList.length}
				renderCellValue={renderCellValue}
			/>
			<EuiFlexGroup justifyContent="spaceBetween" alignItems="center" responsive={false} wrap>
				<EuiFlexItem grow={false}>
					<EuiPopover
						button={popoverButton}
						isOpen={isPopoverOpen}
						closePopover={closePopover}
						panelPaddingSize="none"
					>
						<EuiContextMenuPanel items={pageSizeItemComponents} />
					</EuiPopover>
				</EuiFlexItem>
				<EuiFlexItem grow={false}>
					<EuiPagination
						aria-label="Custom pagination example"
						pageCount={pagination.totalPage}
						activePage={pagination.pageIndex}
						onPageClick={onChangePage}
					/>
				</EuiFlexItem>
			</EuiFlexGroup>
			{isLoading ? <LoadingMask /> : <></>}
		</>
	);
};

export default Permissions;
