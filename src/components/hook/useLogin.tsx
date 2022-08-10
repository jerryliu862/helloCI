import Cookies from 'js-cookie';
import { useCallback, useEffect, useState } from 'react';
import { ECookieName } from '../../util/utilModel';
import apiUtil from '../../util/apiUtil';
import { useGoogleLogin } from '@react-oauth/google';

const useLogin = () => {
	const [googleToken, setGoogleToken] = useState('');

	const doLogin = async () => {
		try {
			const result = await apiUtil.post('/user/login', {
				token: googleToken,
			});
			Cookies.set(ECookieName.COOKIE_AUTH_TOKEN, result?.data?.token, { expires: 1 });
			location.href = 'bonus';
		} catch (error) {
			console.error(error);
		}
	};

	// login
	useEffect(() => {
		if (!Boolean(googleToken)) return;
		doLogin();
	}, [googleToken]);

	const onGoogleSignIn = useGoogleLogin({
		onSuccess: tokenResponse => {
			setGoogleToken(tokenResponse?.access_token);
		},
	});

	return { onGoogleSignIn };
};

export default useLogin;
