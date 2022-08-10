import { IRankListItem, IAdjustLeaderboardItem } from '../../util/utilModel';
import { EuiBasicTable } from '@elastic/eui';
import React, { useState } from 'react';
import NumberFormatInput from '../common/NumberFormatInput';
import numberUtil from '../../util/numberUtil';

const initialTableListState = ({
	rankList,
	adjustData,
	leaderboardID,
}: {
	rankList: IRankListItem[] | [];
	adjustData: IAdjustLeaderboardItem[] | [];
	leaderboardID: string;
}) => {
	const currentAdjustLeaderboard = adjustData.find((item: any) => item.leaderboardID === leaderboardID);
	// 有對應，更新為先前修改過的狀態
	if (currentAdjustLeaderboard) {
		const adjustRankList = currentAdjustLeaderboard.rankList;
		const updateRankList = rankList.map((originItem: IRankListItem) => {
			const needUpdateItem = adjustRankList.find(
				(newItem: IRankListItem) => originItem.rankID === newItem.rankID,
			);

			return Boolean(needUpdateItem)
				? {
						...originItem,
						fixedBonus: needUpdateItem.fixedBonus,
						variableBonus: needUpdateItem.variableBonus,
						totalBonus: needUpdateItem.totalBonus,
				  }
				: originItem;
		});
		return updateRankList;
	}
	return rankList;
};

enum EEditCellTypeKey {
	FIXED_BONUS = 'fixedBonus',
	VARIABLE_BONUS = 'variableBonus',
}

const updateAdjustData = ({
	adjustData,
	leaderboardID,
	editRankItem,
	newEditValue,
	newTotalBonus,
	editCellType,
	setAdjustData,
}: {
	adjustData: IAdjustLeaderboardItem[] | [];
	leaderboardID: string;
	setAdjustData: React.Dispatch<React.SetStateAction<[] | IAdjustLeaderboardItem[]>>;
	editRankItem: IRankListItem;
	newEditValue: number;
	newTotalBonus: number;
	editCellType: EEditCellTypeKey;
}) => {
	const currentAdjustLeaderboard = adjustData.find((item: any) => item.leaderboardID === leaderboardID);
	// 儲存修改的 table state 項目回去
	Boolean(currentAdjustLeaderboard)
		? setAdjustData(previousBoardList => {
				const adjustRankList = currentAdjustLeaderboard.rankList;
				const adjustRankItem = adjustRankList.find(
					(item: IRankListItem) => item.rankID === editRankItem.rankID,
				);
				// 有對應的 leaderbord 須確認要更新或新增 rank 項目
				const newRankList = Boolean(adjustRankItem)
					? adjustRankList.map(item => {
							return item.rankID === editRankItem.rankID
								? {
										...item,
										[editCellType]: newEditValue,
										totalBonus: newTotalBonus,
								  }
								: item;
					  })
					: [
							...adjustRankList,
							{
								...editRankItem,
								[editCellType]: newEditValue,
								totalBonus: newTotalBonus,
							},
					  ];
				return previousBoardList.map((board: IAdjustLeaderboardItem) => {
					return board.leaderboardID === currentAdjustLeaderboard.leaderboardID
						? {
								...board,
								rankList: newRankList,
						  }
						: board;
				});
		  })
		: setAdjustData(previousBoardList => {
				// 沒有對應的 leaderbord 被修改，則新增
				return [
					...previousBoardList,
					{
						leaderboardID,
						rankList: [
							{
								...editRankItem,
								[editCellType]: newEditValue,
								totalBonus: newTotalBonus,
							},
						],
					},
				];
		  });
};

const EditDataTable: React.FC<{
	rankList: IRankListItem[] | [];
	leaderboardID: string;
	adjustData: IAdjustLeaderboardItem[] | [];
	setAdjustData: React.Dispatch<React.SetStateAction<[] | IAdjustLeaderboardItem[]>>;
	setEditTotalBonusDiff: React.Dispatch<React.SetStateAction<number>>;
	isApproved: boolean;
	targetCurrency: any;
}> = props => {
	const { rankList, leaderboardID, adjustData, isApproved, setAdjustData, setEditTotalBonusDiff, targetCurrency } =
		props;
	const [tableListState, setTableListState] = useState<IRankListItem[] | []>(
		initialTableListState({ rankList, leaderboardID, adjustData }),
	);
	const [pageIndex, setPageIndex] = useState(0);
	const [pageSize, setPageSize] = useState(15);
	const [sortField, setSortField] = useState<keyof IRankListItem>('rank');
	const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

	const onTableChange = ({
		page = { index: 0, size: 0 },
		sort = { field: 'rank', direction: 'asc' },
	}: {
		page: { index: number; size: number };
		sort: { field: keyof IRankListItem; direction: 'asc' | 'desc' };
	}) => {
		const { index: pageIndex, size: pageSize } = page;
		const { field: sortField, direction: sortDirection } = sort;
		setPageIndex(pageIndex);
		setPageSize(pageSize);
		setSortField(sortField);
		setSortDirection(sortDirection);
	};

	const sorting = {
		sort: {
			field: sortField,
			direction: sortDirection,
		},
	};

	const pagination = {
		pageIndex: pageIndex,
		pageSize: pageSize,
		totalItemCount: tableListState.length,
		pageSizeOptions: [3, 5, 10],
	};

	const editTableColumns: any[] = [
		{ field: 'rank', name: 'Rank', sortable: true, align: 'center' },
		{
			field: 'score',
			name: 'Score',
			sortable: true,
			align: 'center',
			render: (value: any) => numberUtil.amountFormat(value),
		},
		{ field: 'openID', name: 'Open ID', sortable: true, align: 'center' },
		{ field: 'userID', name: 'User ID', sortable: true, align: 'center' },
		{ field: 'userRegion', name: 'User Region', align: 'center' },
		{
			field: 'fixedBonus',
			name: 'Fixed Bonus',
			width: '200px',
			align: 'center',
			render: (value: any, editRankItem: IRankListItem) => (
				<NumberFormatInput
					targetCurrency={targetCurrency}
					disabled={isApproved}
					handleValueChange={(inputValue: string) => {
						const newFixedBonus = Number(inputValue);
						const newTotalBonus = Number(inputValue) + editRankItem.variableBonus;
						setTableListState((prev: IRankListItem[]) =>
							prev?.map((item: IRankListItem) => {
								const isSameListItem = item?.userID === editRankItem?.userID;
								// 重新加總 campaign total bonus
								isSameListItem && setEditTotalBonusDiff(prev => prev + newTotalBonus - item.totalBonus);
								return isSameListItem
									? {
											...item,
											fixedBonus: newFixedBonus,
											totalBonus: newTotalBonus,
									  }
									: item;
							}),
						);
						updateAdjustData({
							adjustData,
							leaderboardID,
							setAdjustData,
							editRankItem,
							newEditValue: newFixedBonus,
							newTotalBonus,
							editCellType: EEditCellTypeKey.FIXED_BONUS,
						});
					}}
					tableValue={value}
					key={value}
				/>
			),
		},
		{
			field: 'variableBonus',
			name: 'Variable Bonus',
			align: 'center',
			width: '200px',
			render: (value: any, editRankItem: IRankListItem) => (
				<NumberFormatInput
					targetCurrency={targetCurrency}
					disabled={isApproved}
					handleValueChange={(inputValue: string) => {
						const newVariableBonus = Number(inputValue);
						const newTotalBonus = Number(inputValue) + editRankItem.fixedBonus;
						setTableListState((prev: IRankListItem[]) =>
							prev?.map((item: IRankListItem) => {
								const isSameListItem = item?.userID === editRankItem?.userID;
								// 重新加總 campaign total bonus
								isSameListItem && setEditTotalBonusDiff(prev => prev + newTotalBonus - item.totalBonus);
								return isSameListItem
									? {
											...item,
											variableBonus: newVariableBonus,
											totalBonus: newTotalBonus,
									  }
									: item;
							}),
						);
						// 更新已編輯資料
						updateAdjustData({
							adjustData,
							leaderboardID,
							setAdjustData,
							editRankItem,
							newEditValue: newVariableBonus,
							newTotalBonus,
							editCellType: EEditCellTypeKey.VARIABLE_BONUS,
						});
					}}
					tableValue={value}
					key={value}
				/>
			),
		},
		{
			field: 'totalBonus',
			name: 'Total Bonus',
			align: 'center',
			sortable: true,
			render: (value: number) =>
				`${targetCurrency?.currencyCode} ${numberUtil.amountFormat(value, targetCurrency?.currencyFormat)}`,
		},
	];

	const displayData = tableListState
		.sort((a: any, b: any) => {
			return sortDirection === 'asc' ? a[sortField] - b[sortField] : b[sortField] - a[sortField];
		})
		.filter((_: any, index: number) => index + 1 <= (pageIndex + 1) * pageSize && index >= pageIndex * pageSize);

	return (
		<>
			<EuiBasicTable
				tableCaption="Bonus Edit Table"
				items={displayData}
				rowHeader="rank"
				columns={editTableColumns}
				sorting={sorting}
				onChange={onTableChange}
				pagination={pagination}
			/>
		</>
	);
};
export default EditDataTable;
