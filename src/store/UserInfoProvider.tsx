import React from 'react';
import useLogin from '../components/hook/useLogin';

interface IUserInfoContextStore {
	onGoogleSignIn: () => void;
}

const initialStore: IUserInfoContextStore = {
	onGoogleSignIn() {},
};

export const UserInfoContext = React.createContext(initialStore);

export const UserInfoProvider: React.FC = props => {
	const { children } = props;
	const { onGoogleSignIn } = useLogin();

	const store = {
		onGoogleSignIn,
	};

	return <UserInfoContext.Provider value={store}>{children}</UserInfoContext.Provider>;
};
