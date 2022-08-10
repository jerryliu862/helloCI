import React, { ReactChild, useEffect, useState } from 'react';
import '@elastic/eui/dist/eui_theme_light.css';

import {
	EuiSideNav,
	htmlIdGenerator,
	EuiPageSideBar,
	EuiPageBody,
	EuiPageContent,
	EuiPageContentBody,
	EuiPage,
	useEuiTheme,
} from '@elastic/eui';
import { useLocation } from 'react-router-dom';
import styled, { ThemeProvider } from 'styled-components';
import { theme } from 'styled-tools';
import Cookies from 'js-cookie';
import { ECookieName } from '../util/utilModel';

const Layout: React.FC<{ children: ReactChild }> = ({ children }) => {
	const { euiTheme } = useEuiTheme();
	const { pathname } = useLocation();
	const [isSideNavOpenOnMobile, setSideNavOpenOnMobile] = useState(false);
	const [selectedItemName, setSelectedItem] = useState(null);
	const isLogin = pathname === '/login';
	const toggleOpenOnMobile = () => {
		setSideNavOpenOnMobile(!isSideNavOpenOnMobile);
	};
	const selectItem = name => {
		setSelectedItem(name);
	};

	const createItem = (name, data = {}) => {
		// NOTE: Duplicate `name` values will cause `id` collisions.
		return {
			id: name,
			name,
			isSelected: selectedItemName === name,
			onClick: () => selectItem(name),
			...data,
		};
	};

	useEffect(() => {
		window.scrollTo(0, 0);
	}, [pathname]);

	const createSideNav = (currentPath: string) => [
		{
			name: '',
			id: htmlIdGenerator('sideNav')(),
			items: [
				{
					name: 'Bonus',
					id: htmlIdGenerator('Bonus')(),
					href: '/bonus',
					isSelected: currentPath.includes('/bonus'),
				},
				{
					name: 'Payout',
					id: htmlIdGenerator('Payout')(),
					href: '/payout',
					isSelected: currentPath.includes('/payout'),
				},
				{
					name: 'Report',
					id: htmlIdGenerator('Report')(),
					href: '/report',
					isSelected: currentPath === '/report',
				},
				createItem('Settings', {
					onClick: undefined,
					items: [
						{
							name: 'Tax Rate',
							id: htmlIdGenerator('taxRate')(),
							href: '/settings/taxRate',
							isSelected: currentPath === '/settings/taxRate',
						},
						{
							name: 'Permissions',
							id: htmlIdGenerator('permissions')(),
							href: '/settings/permissions',
							isSelected: currentPath.includes('/settings/permissions'),
						},
						{
							name: 'Assign Campaign Region',
							id: htmlIdGenerator('assignCampaignRegion')(),
							href: '/settings/assignCampaignRegion',
							isSelected: currentPath === '/settings/assignCampaignRegion',
						},
					],
				}),
				{
					name: 'Log out',
					id: htmlIdGenerator('logout')(),
					onClick: () => {
						Cookies.remove(ECookieName.COOKIE_AUTH_TOKEN);
						location.href = '/login';
					},
				},
			],
		},
	];

	return (
		<ThemeProvider theme={euiTheme}>
			<EuiPage style={{ height: '100vh' }}>
				{!isLogin && (
					<EuiPageSideBar>
						<CustomNavItem>
							<EuiSideNav
								heading={null}
								toggleOpenOnMobile={() => toggleOpenOnMobile()}
								isOpenOnMobile={isSideNavOpenOnMobile}
								items={createSideNav(pathname)}
							/>
						</CustomNavItem>
					</EuiPageSideBar>
				)}
				<EuiPageBody component="div">
					<EuiPageContent>
						<EuiPageContentBody>{children}</EuiPageContentBody>
					</EuiPageContent>
				</EuiPageBody>
			</EuiPage>
		</ThemeProvider>
	);
};

export default Layout;

const CustomNavItem = styled.div`
	.euiSideNavItem--trunk {
		padding: 10px 0 10px 20px;
		position: relative;
		.euiSideNavItemButton-isSelected {
			color: ${theme('colors.customColorPrimary')};
			::before {
				position: absolute;
				content: ' ';
				width: 5px;
				height: 27px;
				left: 5px;
				top: 50%;
				transform: translateY(-50%);
				background-color: ${theme('colors.customColorPrimary')};
			}
		}
	}
	.euiSideNavItem--branch .euiSideNavItemButton-isSelected {
		::before {
			background-color: unset;
		}
	}
	a:hover {
		color: ${theme('colors.customColorPrimary')};
	}
`;
