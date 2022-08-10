import React from 'react';
import styled from 'styled-components';

const DataNotFound = () => {
	return (
		<NoDataWrapper>
			<h1>No result found</h1>
		</NoDataWrapper>
	);
};

export default DataNotFound;

const NoDataWrapper = styled.div`
	position: absolute;
	top: 50%;
	left: 40%;
	z-index: 10;
	h1 {
		text-align: center;
	}
`;
