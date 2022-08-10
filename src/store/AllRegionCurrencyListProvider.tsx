import React from 'react';

import useRegionSelectOptions from 'src/components/hook/useRegionSelectOptions';

interface IAllRegionCurrencyListContextStore {
	regionCurrencyOptions: any[];
}

const initialStore: IAllRegionCurrencyListContextStore = {
	regionCurrencyOptions: [],
};

export const AllRegionCurrencyListContext = React.createContext(initialStore);

export const AllRegionCurrencyListProvider: React.FC = props => {
	const { children } = props;
	const { regionOptions: regionCurrencyOptions } = useRegionSelectOptions();

	const store = {
		regionCurrencyOptions,
	};

	return <AllRegionCurrencyListContext.Provider value={store}>{children}</AllRegionCurrencyListContext.Provider>;
};
