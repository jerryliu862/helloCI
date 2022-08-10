import { EuiBasicTable } from '@elastic/eui';
import styled from 'styled-components';
import { theme } from 'styled-tools';

export const CustomTable = styled(EuiBasicTable)`
	margin: 20px 0 40px;
	.euiTableCellContent {
		display: flex;
		justify-content: center;
		align-items: center;
		border-right: 1px solid ${theme('colors.lightShade')};
		min-height: 56px;
	}
	thead {
		background-color: ${theme('colors.lightestShade')};
	}
	table {
		border-top: 1px solid ${theme('colors.lightShade')};
		border-left: 1px solid ${theme('colors.lightShade')};
		border-bottom: 1px solid ${theme('colors.lightShade')};
	}
`;
