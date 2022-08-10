import React, { useState } from 'react';
import styled from 'styled-components';
import { theme } from 'styled-tools';

import {
	EuiButton,
	EuiCheckbox,
	EuiComboBox,
	EuiDatePicker,
	EuiFieldSearch,
	EuiFlexGroup,
	EuiFlexItem,
	EuiFormRow,
	useGeneratedHtmlId,
} from '@elastic/eui';
import { EAuthTypesValue, EFilterComboboxDataSetStateType, IBonusFilterCondition } from '../../util/utilModel';
import useRegionSelectOption from 'src/components/hook/useRegionSelectOptions';
import moment from 'moment';

interface IBonusFilterProps {
	filterCondition: IBonusFilterCondition;
	setFilterCondition: React.Dispatch<React.SetStateAction<IBonusFilterCondition>>;
	setPagination: React.Dispatch<React.SetStateAction<{ pageIndex: number; pageSize: number }>>;
}

const statusOptionsStatic = [
	{
		label: 'ALL',
	},
	{
		label: 'Waiting',
	},
	{
		label: 'Approved',
	},
];

const onCreateOption = ({
	stateType,
	searchValue,
	flattenedOptions,
	optionsState,
	selectedOptionsState,
	setFilterCondition,
	setOptionsCallback,
}: {
	stateType: EFilterComboboxDataSetStateType;
	searchValue: string;
	flattenedOptions: any[];
	optionsState: any;
	selectedOptionsState: any;
	setFilterCondition: React.Dispatch<React.SetStateAction<IBonusFilterCondition>>;
	setOptionsCallback: React.Dispatch<React.SetStateAction<any[]>>;
}) => {
	const normalizedSearchValue = searchValue.trim().toLowerCase();
	if (!normalizedSearchValue) {
		return;
	}
	const newOption = {
		label: searchValue,
	};
	if (flattenedOptions.findIndex(option => option.label.trim().toLowerCase() === normalizedSearchValue) === -1) {
		setOptionsCallback([...optionsState, newOption]);
	}
	setFilterCondition(prev => {
		return { ...prev, [stateType]: [...selectedOptionsState, newOption] };
	});
};

const BonusFilterHeader: React.FC<IBonusFilterProps> = ({ filterCondition, setFilterCondition, setPagination }) => {
	const { campaignEndDate, selectedRegionOptions, selectedStatusOptions, isCheckBonusZero, searchText } =
		filterCondition;
	const [statusOptions, setStatusOptions] = useState<{ label: string }[]>(statusOptionsStatic);
	const bonusZeroCheckboxId = useGeneratedHtmlId({ prefix: 'basicCheckbox' });
	const { regionOptions } = useRegionSelectOption(EAuthTypesValue.BONUS);

	return (
		<div>
			<HeaderFilterGroupWrapper>
				<EuiFlexGroup>
					<EuiFlexItem>
						<EuiFormRow label="Campaign End Time">
							<EuiDatePicker
								selected={campaignEndDate}
								onChange={(date: moment.Moment) => {
									setFilterCondition(prev => ({ ...prev, campaignEndDate: date }));
								}}
								dateFormat={'YYYY-MM'}
								calendarClassName="custom-calendar"
								onFocus={() => {
									!Boolean(campaignEndDate) &&
										setFilterCondition(prev => ({
											...prev,
											campaignEndDate: moment(),
										}));
								}}
							/>
						</EuiFormRow>
					</EuiFlexItem>
					<EuiFlexItem>
						<EuiFormRow label="Campaign Region">
							<EuiComboBox
								placeholder="Select or create region"
								options={regionOptions}
								selectedOptions={selectedRegionOptions}
								onChange={(selectedOptions: any) => {
									setFilterCondition(prev => ({ ...prev, selectedRegionOptions: selectedOptions }));
								}}
								isClearable={true}
							/>
						</EuiFormRow>
					</EuiFlexItem>
					<EuiFlexItem>
						<EuiFormRow label="Approval Status">
							<EuiComboBox
								placeholder="Select or create status"
								options={statusOptions}
								selectedOptions={selectedStatusOptions}
								singleSelection={{ asPlainText: true }}
								onChange={(selectedOptions: any) => {
									setFilterCondition(prev => ({ ...prev, selectedStatusOptions: selectedOptions }));
								}}
								onCreateOption={(searchValue: string, flattenedOptions: any[] = []) => {
									onCreateOption({
										stateType: EFilterComboboxDataSetStateType.SELECT_STATUS_OPTIONS,
										searchValue,
										flattenedOptions,
										optionsState: statusOptions,
										selectedOptionsState: selectedStatusOptions,
										setOptionsCallback: setStatusOptions,
										setFilterCondition,
									});
								}}
								isClearable={false}
							/>
						</EuiFormRow>
					</EuiFlexItem>
					<CheckboxWrapper>
						<EuiCheckbox
							id={bonusZeroCheckboxId}
							label={<h4>Bonus is 0</h4>}
							checked={isCheckBonusZero}
							onChange={(e: any) =>
								setFilterCondition(prev => ({ ...prev, isCheckBonusZero: e.target.checked }))
							}
						/>
					</CheckboxWrapper>
				</EuiFlexGroup>
				<EuiFlexGroup justifyContent="flexStart">
					<EuiFlexItem grow={false}>
						<EuiFormRow label="Search">
							<EuiFieldSearch
								placeholder="Search by Campaign ID, Title"
								value={searchText}
								onChange={(e: any) =>
									setFilterCondition(prev => ({ ...prev, searchText: e.target.value }))
								}
								isClearable={true}
								style={{ width: 350 }}
							/>
						</EuiFormRow>
					</EuiFlexItem>
					<EuiFlexItem grow={false}>
						<EuiButton
							style={{ marginTop: 'auto' }}
							onClick={() => setPagination(prev => ({ ...prev, pageIndex: 0 }))}
						>
							Search
						</EuiButton>
					</EuiFlexItem>
					<EuiFlexItem grow={false}>
						<EuiButton
							style={{ marginTop: 'auto' }}
							onClick={() => {
								setFilterCondition({
									campaignEndDate: null,
									selectedRegionOptions: [],
									selectedStatusOptions: [{ label: 'ALL' }],
									isCheckBonusZero: false,
									searchText: '',
								});
								setPagination(prev => ({ ...prev, pageIndex: 0 }));
							}}
						>
							Reset
						</EuiButton>
					</EuiFlexItem>
				</EuiFlexGroup>
			</HeaderFilterGroupWrapper>
		</div>
	);
};

export default BonusFilterHeader;

const HeaderFilterGroupWrapper = styled.div`
	padding: 18px;
	margin: 30px 0;
	border: 1px solid ${theme('colors.lightestShade')};
`;
const CheckboxWrapper = styled(EuiFlexItem)`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
`;
