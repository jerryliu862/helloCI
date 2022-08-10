import { EuiThemeProvider, useEuiTheme } from '@elastic/eui';
import React from 'react';

export interface ThemeExtensions {
	colors: {
		customColorPrimary: string;
	};
}

// 讓此層決定日夜模式，設定好palette後改變子層hook euiTheme, 因此ThemeProvider移至layout
const EnhancedThemeProvider: React.FC = props => {
	const { children } = props;
	const primaryOverrides = {
		colors: {
			LIGHT: {
				customColorPrimary: '#6610f2',
			},
			DARK: {
				customColorPrimary: '#6610f2',
			},
		},
	};
	return <EuiThemeProvider modify={primaryOverrides}>{children as React.ReactElement}</EuiThemeProvider>;
};

export default EnhancedThemeProvider;
