import React, { useContext } from 'react';
import styled from 'styled-components';

import { EuiCard, EuiButton, useEuiTheme } from '@elastic/eui';
import { ThemeExtensions } from '../store/EnhanceThemeProvider';
import { UserInfoContext } from '../store/UserInfoProvider';

const Login: React.FC = () => {
	const { euiTheme } = useEuiTheme<ThemeExtensions>();
	const { onGoogleSignIn } = useContext(UserInfoContext);
	return (
		<Wrapper>
			<SystemTitle>Event Bonus Calculator</SystemTitle>
			<LoginContainer
				paddingSize="l"
				title="Sign in"
				icon={null}
				description={
					<>
						<SignInButton
							fill
							onClick={onGoogleSignIn}
							style={{
								backgroundColor: euiTheme.colors.customColorPrimary,
							}}
						>
							Sign in with google
						</SignInButton>
					</>
				}
			/>
		</Wrapper>
	);
};

export default Login;

const Wrapper = styled.div`
	margin: 0 auto;
	max-width: 560px;
`;

const SystemTitle = styled.h1`
	font-weight: bold;
	font-size: 28px;
	text-align: center;
	margin: 60px 0;
`;

const LoginContainer = styled(EuiCard)`
	margin: 0 auto;
	max-width: 375px;
`;

const SignInButton = styled(EuiButton)`
	margin-top: 10px;
`;
