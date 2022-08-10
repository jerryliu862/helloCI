import { EBonusType, IPayoutDetailListItem } from '../../util/utilModel';
import { EuiCheckbox, EuiDataGrid, EuiDataGridColumn, EuiIcon, EuiLink, useGeneratedHtmlId } from '@elastic/eui';
import React, { useState, useCallback, useRef } from 'react';
import styled from 'styled-components';
import numberUtil from '../../util/numberUtil';
import { useParams } from 'react-router-dom';

const dataGridColumns: EuiDataGridColumn[] = [
	{ id: 'openID', displayAsText: 'Open ID', isResizable: true, initialWidth: 150 },
	{ id: 'userID', displayAsText: 'UserID', isResizable: true, initialWidth: 150 },
	{ id: 'region', displayAsText: 'User Region', isResizable: true, initialWidth: 120 },
	{ id: 'campaignID', displayAsText: 'Campaign ID', isResizable: true, initialWidth: 150 },
	{ id: 'campaignTitle', displayAsText: 'Campaign', isResizable: true, initialWidth: 150 },
	{ id: 'bonusType', displayAsText: 'Type', isResizable: true, initialWidth: 150 },
	{ id: 'amount', displayAsText: 'Amount', isResizable: true, initialWidth: 150 },
	{ id: 'remark', displayAsText: 'Remark', isResizable: true, initialWidth: 150 },
];

const BonusTypeText: React.FC<{ bonusType: EBonusType }> = ({ bonusType }) => {
	switch (bonusType) {
		case EBonusType.ADDON:
			return <>{'Addon'}</>;
		case EBonusType.DEDUCTION:
			return <>{'Deduction'}</>;
		case EBonusType.FIXED_BONUS:
			return <>{'Fixed Bonus'}</>;
		case EBonusType.TRANSPORTATION:
			return <>{'Transportation'}</>;
		case EBonusType.VARIABLE_BONUS:
			return <>{'Variable Bonus'}</>;
		default:
			return <>{bonusType}</>;
	}
};

const PayoutDetailDataGrid: React.FC<{
	setModalShow: React.Dispatch<React.SetStateAction<boolean>>;
	setSelectData: React.Dispatch<React.SetStateAction<any>>;
	setSelectGroupData: React.Dispatch<React.SetStateAction<any[]>>;
	setIsShowDeleteModal: React.Dispatch<React.SetStateAction<boolean>>;
	selectGroupData: any[];
	gridData: any[];
	targetCurrency: any;
	isPaid: boolean;
	searchText: string;
}> = ({
	setModalShow,
	setSelectData,
	setSelectGroupData,
	selectGroupData,
	setIsShowDeleteModal,
	gridData,
	targetCurrency,
	isPaid,
	searchText,
}) => {
	const [visibleColumns, setVisibleColumns] = useState(dataGridColumns.map(({ id }) => id));
	const gridRef = useRef(null);

	// Sorting
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
			width: 100,
			headerCellRender: () => <div>{'Edit/Delete'}</div>,
			rowCellRender: ({ rowIndex }: { rowIndex: number }) => {
				const targetListItem: IPayoutDetailListItem = gridData[rowIndex];
				const isShowDeleteIcon =
					targetListItem?.bonusType !== EBonusType.FIXED_BONUS &&
					targetListItem?.bonusType !== EBonusType.VARIABLE_BONUS;
				return isPaid ? (
					<></>
				) : (
					<TrailingIconWrapper>
						<CustomEuiIcon
							type="pencil"
							onClick={() => {
								setSelectData(targetListItem);
								setModalShow(true);
							}}
						/>
						{isShowDeleteIcon && (
							<CustomEuiIcon
								type="trash"
								onClick={() => {
									setSelectData(targetListItem);
									setIsShowDeleteModal(true);
								}}
							/>
						)}
					</TrailingIconWrapper>
				);
			},
		},
	];

	const basicCheckboxId = useGeneratedHtmlId({ prefix: `basicCheckbox` });

	const leadingControlColumns = [
		{
			id: 'select',
			width: 60,
			headerCellRender: () => {
				const isAllSelect = selectGroupData.length === gridData.length;
				return (
					<EuiCheckbox
						id={`${basicCheckboxId}-all-select`}
						label=""
						checked={isAllSelect}
						onChange={() => {
							isAllSelect
								? setSelectGroupData([])
								: setSelectGroupData(gridData.map((item, index) => ({ ...item, index: index })));
						}}
					/>
				);
			},
			rowCellRender: ({ rowIndex }: { rowIndex: number }) => {
				const isChecked = selectGroupData.some((item: any) => item.index === rowIndex);
				return (
					<EuiCheckbox
						id={`${basicCheckboxId}-${rowIndex}`}
						label=""
						checked={isChecked}
						onChange={() => {
							isChecked
								? setSelectGroupData(prev => [...prev].filter((item: any) => item.index !== rowIndex))
								: setSelectGroupData(prev => [...prev, { ...gridData[rowIndex], index: rowIndex }]);
						}}
					/>
				);
			},
		},
	];

	return (
		<EuiDataGrid
			aria-label="Data grid demo"
			columns={dataGridColumns}
			columnVisibility={{ visibleColumns, setVisibleColumns }}
			rowCount={gridData.length}
			inMemory={{ level: 'sorting' }}
			sorting={{ columns: sortingColumns, onSort }}
			leadingControlColumns={leadingControlColumns}
			trailingControlColumns={trailingControlColumns}
			// Required. Renders the content of each cell. The current example outputs the row and column position.
			// Treated as a React component allowing hooks, context, and other React concepts to be used.
			renderCellValue={({ rowIndex, columnId }) => {
				const cellValue = gridData?.[rowIndex]?.[columnId] ?? null;
				switch (columnId) {
					case 'openID':
					case 'userID':
					case 'campaignTitle':
						const hasSearchText =
							searchText && `${cellValue}`.toLowerCase().includes(searchText.toLowerCase());
						return <SearchCell isHighLight={hasSearchText}>{cellValue}</SearchCell>;
					case 'bonusType':
						return <BonusTypeText bonusType={cellValue} />;
					case 'amount':
						return `${targetCurrency?.currencyCode} ${numberUtil.amountFormat(
							cellValue,
							targetCurrency?.currencyFormat,
						)}`;
					default:
						return cellValue;
				}
			}}
			ref={gridRef}
		/>
	);
};

export default PayoutDetailDataGrid;

const TrailingIconWrapper = styled.div`
	display: flex;
	align-items: center;
	justify-content: space-around;
`;

const CustomEuiIcon = styled(EuiIcon)`
	cursor: pointer;
`;

const SearchCell = styled.span<{ isHighLight: boolean }>`
	background-color: ${props => (props.isHighLight ? '#f0d486' : 'none')};
`;
