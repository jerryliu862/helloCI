import React from 'react';
import useToast from '../components/hook/useToast';

interface IGlobalToastContextStore {
	toasts: any;
	setToasts: (data: any) => void;
	removeToast: (data: any) => void;
	handleAlertApiError: (error: any) => void;
}

const initialStore: IGlobalToastContextStore = {
	toasts: [],
	setToasts: () => {},
	removeToast: () => {},
	handleAlertApiError: () => {},
};

export const GlobalToastContext = React.createContext(initialStore);

export const GlobalToastProvider: React.FC = props => {
	const { children } = props;
	const { toasts, setToasts, removeToast, handleAlertApiError } = useToast();

	const store = {
		toasts,
		setToasts,
		removeToast,
		handleAlertApiError,
	};

	return <GlobalToastContext.Provider value={store}>{children}</GlobalToastContext.Provider>;
};
