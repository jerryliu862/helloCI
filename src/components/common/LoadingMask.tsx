import { EuiLoadingChart, EuiOverlayMask, EuiTitle } from '@elastic/eui';
import React from 'react';

const LoadingMask: React.FC = () => {
	return (
		<EuiOverlayMask>
			<EuiTitle>
				<h2>
					<EuiLoadingChart size="xl" />
				</h2>
			</EuiTitle>
		</EuiOverlayMask>
	);
};

export default LoadingMask;
