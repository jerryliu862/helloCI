import Cookies from 'js-cookie';
import { useContext, useEffect, useState } from 'react';
import { GlobalToastContext } from 'src/store/GlobalToastProvider';
import apiUtil from 'src/util/apiUtil';
import { EAuthTypesValue, ECookieName } from 'src/util/utilModel';

const useRegionSelectOptions = (authType?: EAuthTypesValue) => {
	const { handleAlertApiError } = useContext(GlobalToastContext);
	const [regionOptions, setRegionOptions] = useState([]);
	const isLogin = Boolean(Cookies.get(ECookieName.COOKIE_AUTH_TOKEN));
	const getRegionList = async () => {
		try {
			const result = await apiUtil.get(`/region`, {
				params: {
					...(authType ? { authType } : {}),
				},
			});
			result.status === 200 && setRegionOptions(result.data.map((item: any) => ({ ...item, label: item.code })));
		} catch (error) {
			handleAlertApiError(error);
		}
	};

	useEffect(() => {
		isLogin && getRegionList();
	}, []);

	return { regionOptions };
};

export default useRegionSelectOptions;
