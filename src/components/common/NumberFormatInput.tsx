import numberUtil from '../../util/numberUtil';
import { EuiFieldText } from '@elastic/eui';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

const numberRule = /^\d*\.?\d*$/;

enum EInputState {
	EDIT = 'EDIT',
	READ = 'READ',
}

const NumberFormatInput: React.FC<{
	tableValue: string;
	handleValueChange: (data: any) => void;
	disabled?: boolean;
	targetCurrency?: any;
}> = props => {
	const { tableValue, disabled = false, handleValueChange, targetCurrency } = props;
	const [editValue, setEditValue] = useState(tableValue);
	const [amountText, setAmountText] = useState<string>(numberUtil.amountFormat(tableValue));
	const [inputState, setInputState] = useState<EInputState>(EInputState.READ);

	useEffect(() => {
		setEditValue(tableValue);
		setAmountText(numberUtil.amountFormat(tableValue));
	}, [tableValue]);

	return (
		<Wrapper
			isDisabled={disabled}
			onMouseEnter={() => {
				if (disabled) return;
				setInputState(EInputState.EDIT);
			}}
			onMouseLeave={() => {
				if (disabled) return;
				setInputState(EInputState.READ);
				if (editValue === tableValue) return;
				handleValueChange(editValue);
			}}
		>
			{inputState === EInputState.EDIT ? (
				<EuiFieldText
					name="budget"
					prepend={targetCurrency?.currencyCode}
					value={editValue}
					onChange={(e: any) => {
						const targetValue = e.target.value.trim();
						if (!numberRule.test(targetValue)) return;
						setEditValue(targetValue);
						setAmountText(numberUtil.amountFormat(targetValue));
					}}
				/>
			) : (
				<EuiFieldText name="budget" prepend={targetCurrency?.currencyCode} value={amountText} disabled={true} />
			)}
		</Wrapper>
	);
};

export default NumberFormatInput;

const Wrapper = styled.div<{ isDisabled: boolean }>`
	.euiFieldText:disabled {
		background-color: white;
		cursor: ${props => (props.isDisabled ? 'not-allowed' : 'pointer')};
	}
`;
