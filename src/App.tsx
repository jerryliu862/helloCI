import React, { useContext } from 'react';
import { BrowserRouter, Navigate, Outlet, Route, Routes } from 'react-router-dom';

import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import Bonus from './page/Bonus';
import BonusDetail from './page/BonusDetail';
import Login from './page/Login';
import NotFound from './page/NotFound';
import Payout from './page/Payout';
import Report from './page/Report';
import Permissions from './page/Settings/Permissions';
import EnhancedThemeProvider from './store/EnhanceThemeProvider';
import TaxRate from './page/Settings/TaxRate';
import Edit from './components/permission/Edit';
import BonusEdit from './page/BonusEdit';
import PayoutDetail from './page/PayoutDetail';
import Detail from './components/report/Detail';
import { UserInfoProvider } from './store/UserInfoProvider';
import { ECookieName } from './util/utilModel';
import Cookies from 'js-cookie';
import { GlobalToastContext, GlobalToastProvider } from './store/GlobalToastProvider';
import { CustomToast } from './components/hook/useToast';
import AssignCampaignRegion from './page/Settings/AssignCampaignRegion';
import { AllRegionCurrencyListProvider } from './store/AllRegionCurrencyListProvider';
import { GoogleOAuthProvider } from '@react-oauth/google';

const GAUTH_CLIENT_ID: string = process.env.REACT_APP_GAUTH_CLIENT_ID || '';

const PrivateWrapper = ({ isAuth }) => {
	return isAuth ? <Outlet /> : <Navigate to="/login" />;
};

const RouteContent: React.FC = () => {
	const { toasts, removeToast } = useContext(GlobalToastContext);
	return (
		<>
			<Routes>
				<Route path="/" element={<Navigate to="/bonus" />} />
				<Route path="/login" element={<Login />} />
				<Route element={<PrivateWrapper isAuth={Boolean(Cookies.get(ECookieName.COOKIE_AUTH_TOKEN))} />}>
					<Route path="/login" element={<Navigate to="/bonus" />} />
					<Route path="/bonus" element={<Bonus />} />
					<Route path="/bonus/detail/:campaignId" element={<BonusDetail />} />
					<Route path="/bonus/detail/:campaignId/edit" element={<BonusEdit />} />
					<Route path="/payout" element={<Payout />} />
					<Route path="/payout/detail/:payDate/:region/:id" element={<PayoutDetail />} />
					<Route path="/report" element={<Report />} />
					<Route path="/report/:date/:region/:id" element={<Detail />} />
					<Route path="/settings/taxRate" element={<TaxRate />} />
					<Route path="/settings/permissions" element={<Permissions />} />
					<Route path="/settings/permissions/edit/:id" element={<Edit />} />
					<Route path="/settings/assignCampaignRegion" element={<AssignCampaignRegion />} />
					<Route path="*" element={<NotFound />} />
				</Route>
			</Routes>
			<CustomToast toasts={toasts} removeToast={removeToast} />
		</>
	);
};

const App: React.FC = () => {
	return (
		<GoogleOAuthProvider clientId={GAUTH_CLIENT_ID}>
			<BrowserRouter>
				<EnhancedThemeProvider>
					<Layout>
						<ErrorBoundary>
							<UserInfoProvider>
								<GlobalToastProvider>
									<AllRegionCurrencyListProvider>
										<RouteContent />
									</AllRegionCurrencyListProvider>
								</GlobalToastProvider>
							</UserInfoProvider>
						</ErrorBoundary>
					</Layout>
				</EnhancedThemeProvider>
			</BrowserRouter>
		</GoogleOAuthProvider>
	);
};

export default App;
