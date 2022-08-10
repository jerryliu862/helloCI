import axios from 'axios';
import Cookies from 'js-cookie';
import { ECookieName } from './utilModel';

// Add a request interceptor
axios.interceptors.request.use(
	function (config) {
		config.baseURL = process.env.REACT_APP_API_ORIGIN;
		config.headers['Authorization'] = Cookies.get(ECookieName.COOKIE_AUTH_TOKEN);
		config.headers['Access-Control-Allow-Origin'] = '*';
		config.headers['content-type'] = 'application/json';
		// Do something before request is sent
		return config;
	},
	function (error) {
		// Do something with request error
		return Promise.reject(error);
	},
);

// Add a response interceptor
axios.interceptors.response.use(
	function (response) {
		return response;
	},
	function (error) {
		if (error.response.status === 401) {
			Cookies.remove(ECookieName.COOKIE_AUTH_TOKEN);
			location.href = '/login';
		}
		return Promise.reject(error);
	},
);

export default axios;
