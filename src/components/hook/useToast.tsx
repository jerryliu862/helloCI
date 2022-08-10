import { EuiGlobalToastList } from '@elastic/eui';
import React, { useCallback, useState } from 'react';
import styled from 'styled-components';

export const CustomToast: React.FC<{ toasts: any[]; removeToast: (data: any) => void }> = ({ toasts, removeToast }) => (
	<ToastWrapper>
		<EuiGlobalToastList toasts={toasts} dismissToast={removeToast} toastLifeTimeMs={3000} />
	</ToastWrapper>
);

const useToast = () => {
	const [toasts, setToasts] = useState([]);

	const removeToast = useCallback(
		(removedToast: any) => {
			setToasts(toasts.filter(toast => toast.id !== removedToast.id));
		},
		[toasts],
	);

	const setToastsMiddleware = useCallback(
		(toastConfig: any) => {
			setToasts(
				toasts.concat({
					id: `toast${Date.now()}`,
					...toastConfig,
				}),
			);
		},
		[toasts],
	);

	const handleAlertApiError = useCallback(
		(error: any) => {
			const errorMessage = error?.response?.data?.message ?? '';
			setToasts(
				toasts.concat({
					id: `toast${Date.now()}`,
					title: `Action error! ${errorMessage}`,
					color: 'danger',
				}),
			);
		},
		[toasts],
	);

	return { toasts, setToasts: setToastsMiddleware, removeToast, handleAlertApiError };
};

export default useToast;

const ToastWrapper = styled.div`
	.euiGlobalToastList {
		bottom: 86%;
	}
	.euiGlobalToastList--right:not(:empty) {
		right: 50%;
		transform: translate(50%, 0);
	}
	.euiToastHeader {
		justify-content: center;
	}
`;
