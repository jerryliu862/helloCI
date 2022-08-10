import { ChildProcessWithoutNullStreams } from 'child_process';
import React from 'react';
import styled, { css } from 'styled-components';
import { ifProp } from 'styled-tools';

interface InfoData {
	title: string | null;
	value: string | JSX.Element;
}

const DataInfo: React.FC<{ infoData: InfoData[]; groupCountInOneRow?: number }> = ({
	infoData,
	groupCountInOneRow = 2,
}) => {
	return (
		<DataInfoWrapper>
			{infoData.map(({ title, value }, index) => {
				const isNotString = typeof value !== 'string';
				return (
					<CellGroup key={`${title}-${index}`} groupCountInOneRow={groupCountInOneRow}>
						<Cell>
							<span>{title}</span>
						</Cell>
						<Cell isNotString={isNotString}>{value}</Cell>
					</CellGroup>
				);
			})}
		</DataInfoWrapper>
	);
};

export default DataInfo;

const DataInfoWrapper = styled.div`
	border: 1px solid #d3dae6;
	border-radius: 6px;
	display: flex;
	flex-wrap: wrap;
	border-bottom: none;
	overflow: hidden;
`;

// 控制寬度顯示欄位數
const CellGroup = styled.div<{ groupCountInOneRow: number }>`
	width: ${props => `calc(100%/${props.groupCountInOneRow})`};
	border-bottom: 1px solid #d3dae6;
	display: flex;
	align-items: stretch;
`;

const Cell = styled.div<{ isNotString?: boolean }>`
	min-height: 50px;
	padding: 16px;
	width: 50%;
	text-align: center;
	display: flex;
	align-items: center;
	justify-content: center;
	&:nth-child(odd) {
		font-weight: bold;
		background-color: #f5f7fa;
	}
	${ifProp(
		'isNotString',
		css`
			padding-top: 6px;
			padding-bottom: 6px;
		`,
	)}
`;
