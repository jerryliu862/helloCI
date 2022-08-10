import React from 'react';
import styled from 'styled-components';
import { theme } from 'styled-tools';

import { EuiButton, EuiComboBox, EuiDatePicker, EuiFlexGroup, EuiFlexItem, EuiFormRow } from '@elastic/eui';
import { EAuthTypesValue, IFilterProps } from '../../util/utilModel';
import useRegionSelectOption from 'src/components/hook/useRegionSelectOptions';
import moment from 'moment';
import { useSearchParams } from 'react-router-dom';

const statusOptionsStatic = [
	{
		label: 'ALL',
	},
	{
		label: 'Grouped',
	},
	{
		label: 'Paid',
	},
];

const FilterHeader: React.FC<IFilterProps> = props => {
	const {
		filterCondition,
		setFilterCondition,
		setPagination,
		options = statusOptionsStatic,
		defaultCondition,
	} = props;
	const { billingMonth, selectedRegionOptions, selectedStatusOptions } = filterCondition;
	const { regionOptions } = useRegionSelectOption(EAuthTypesValue.PAYOUT);

	return (
		<div>
			<HeaderFilterGroupWrapper>
				<EuiFlexGroup>
					<EuiFlexItem>
						<EuiFormRow label="Billing Month">
							<EuiDatePicker
								selected={billingMonth}
								onChange={(date: moment.Moment) => {
									setFilterCondition(prev => ({ ...prev, billingMonth: date }));
								}}
								dateFormat={'YYYY-MM'}
								calendarClassName="custom-calendar"
								onFocus={() => {
									!Boolean(billingMonth) &&
										setFilterCondition(prev => ({
											...prev,
											billingMonth: moment(),
										}));
								}}
							/>
						</EuiFormRow>
					</EuiFlexItem>
					<EuiFlexItem>
						<EuiFormRow label="Region">
							<EuiComboBox
								aria-label="Accessible screen reader label"
								placeholder="Select or create region"
								options={regionOptions}
								selectedOptions={selectedRegionOptions}
								onChange={(selectedOptions: any) => {
									setFilterCondition(prev => ({
										...prev,
										selectedRegionOptions: selectedOptions,
									}));
								}}
								isClearable={true}
							/>
						</EuiFormRow>
					</EuiFlexItem>
					<EuiFlexItem>
						<EuiFormRow label="Status">
							<EuiComboBox
								aria-label="Accessible screen reader label"
								placeholder="Select or create status"
								options={options}
								singleSelection={{ asPlainText: true }}
								selectedOptions={selectedStatusOptions}
								onChange={(selectedOptions: any) => {
									setFilterCondition(prev => ({
										...prev,
										selectedStatusOptions: selectedOptions,
									}));
								}}
								isClearable={true}
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
								setFilterCondition(defaultCondition);
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

export default FilterHeader;

const HeaderFilterGroupWrapper = styled.div`
	padding: 18px;
	margin: 30px 0;
	border: 1px solid ${theme('colors.lightestShade')};
`;
