import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
	EuiFlexGroup,
	EuiFlexItem,
	EuiSpacer,
	EuiComboBox,
	EuiBreadcrumbs,
	EuiTitle,
	EuiButton,
	EuiFieldText,
	EuiIcon,
	EuiLoadingSpinner,
} from '@elastic/eui';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import DataInfo from '../DataInfo';
import apiUtil from '../../util/apiUtil';
import { EAuthLevelValue, EAuthTypesValue, IUserInfo, IAuthListItem } from '../../util/utilModel';
import { CustomTable } from '../CustomTable';
import LoadingMask from '../common/LoadingMask';
import { GlobalToastContext } from 'src/store/GlobalToastProvider';
import useRegionSelectOption from 'src/components/hook/useRegionSelectOptions';

enum EAuthTypesName {
	BONUS = 'Bonus',
	PAYOUT = 'Payout / Report',
	SYSTEM_ADMIN = 'System Admin',
	TAX_RATE = 'Tax Rate',
}

enum EAuthLevelName {
	READ = 'Read',
	EDIT = 'Edit',
	APPROVE = 'Approve',
	ALL = 'All',
}

const levelOptions = [
	{
		label: EAuthLevelName.READ,
		value: EAuthLevelValue.READ,
	},
	{
		label: EAuthLevelName.EDIT,
		value: EAuthLevelValue.EDIT,
	},
	{
		label: EAuthLevelName.APPROVE,
		value: EAuthLevelValue.APPROVE,
	},
];

interface IPermissionOption {
	authType: EAuthTypesName;
	isAuthLevelOption: boolean;
}

const permissionOptions: IPermissionOption[] = [
	{ authType: EAuthTypesName.BONUS, isAuthLevelOption: true },
	{ authType: EAuthTypesName.PAYOUT, isAuthLevelOption: true },
	{ authType: EAuthTypesName.SYSTEM_ADMIN, isAuthLevelOption: false },
	{ authType: EAuthTypesName.TAX_RATE, isAuthLevelOption: true },
];

const Edit = () => {
	const navigate = useNavigate();
	const { id } = useParams();
	const isAddMode = id === 'add';
	const [isPageLoading, setIsPageLoading] = useState(false);
	const { setToasts, removeToast, handleAlertApiError } = useContext(GlobalToastContext);
	const [userData, setUserData] = useState<IUserInfo>({ email: '', authList: [] });
	const { regionOptions } = useRegionSelectOption();
	const [permissionTableState, setPermissionTableState] = useState({
		[EAuthTypesName.BONUS]: {
			authType: EAuthTypesValue.BONUS,
			authLevel: [
				{
					label: EAuthLevelName.READ,
					value: EAuthLevelValue.READ,
				},
			],
			regionCode: [
				{
					label: 'TW',
				},
			],
		},
		[EAuthTypesName.PAYOUT]: {
			authType: EAuthTypesValue.PAYOUT,
			authLevel: [
				{
					label: EAuthLevelName.READ,
					value: EAuthLevelValue.READ,
				},
			],
			regionCode: [
				{
					label: 'TW',
				},
			],
		},
		[EAuthTypesName.SYSTEM_ADMIN]: {
			authType: EAuthTypesValue.SYSTEM_ADMIN,
			authLevel: [
				{
					label: EAuthLevelName.EDIT,
					value: EAuthLevelValue.EDIT,
				},
			],
			regionCode: [
				{
					label: 'ALL',
				},
			],
		},
		[EAuthTypesName.TAX_RATE]: {
			authType: EAuthTypesValue.TAX_RATE,
			authLevel: [
				{
					label: EAuthLevelName.READ,
					value: EAuthLevelValue.READ,
				},
			],
			regionCode: [
				{
					label: 'ALL',
				},
			],
		},
	});

	useEffect(() => {
		fetchUserInfo();
	}, []);

	// function area
	const fetchUserInfo = useCallback(async () => {
		if (isAddMode) return;
		setIsPageLoading(true);
		try {
			const result = await apiUtil.get(`/user/${id}`);
			const data: IUserInfo = result?.data ?? {};
			setUserData(data);
		} catch (error) {
			handleAlertApiError(error);
		}
		setIsPageLoading(false);
	}, [id]);

	const createUser = useCallback(async () => {
		if (!userData.email.trim()) {
			setToasts({
				title: `User's email is required!`,
				color: 'danger',
			});
			return;
		}
		setIsPageLoading(true);
		try {
			const bodyAuthList = userData.authList.map((item: IAuthListItem) => ({
				regionCode: item?.regionCode ?? '',
				authType: item?.authType,
				authLevel: item?.authLevel,
			}));
			const result = await apiUtil.post('/user', { email: userData.email, authList: bodyAuthList });
			setIsPageLoading(false);
			result.status === 200 &&
				setToasts({
					title: `Create User's Data Success!`,
					color: 'success',
				});
			navigate('/settings/permissions');
		} catch (error) {
			setIsPageLoading(false);
			handleAlertApiError(error);
		}
	}, [userData, setToasts, handleAlertApiError, removeToast]);

	const updateUser = useCallback(async () => {
		setIsPageLoading(true);
		try {
			const bodyAuthList = userData.authList.map((item: IAuthListItem) => ({
				regionCode: item?.regionCode ?? '',
				authType: item?.authType,
				authLevel: item?.authLevel,
			}));
			const result = await apiUtil.put('/user', {
				uid: userData?.uid,
				status: userData?.status,
				authList: bodyAuthList,
				email: userData?.email,
			});
			setIsPageLoading(false);
			result.status === 200 &&
				setToasts({
					title: `Update User's Data Success!`,
					color: 'success',
				});
			navigate('/settings/permissions');
		} catch (error) {
			setIsPageLoading(false);
			handleAlertApiError(error);
		}
	}, [userData, setToasts, handleAlertApiError, removeToast]);

	const handleGrantPermission = useCallback(
		(value: EAuthTypesName) => {
			const targetTableState = permissionTableState[value];
			const translateItem = {
				authType: targetTableState.authType,
				authLevel: targetTableState.authLevel[0]?.value,
				regionCode: targetTableState.regionCode[0]?.label,
				createTime: new Date().toLocaleString(),
			};
			const { authType, authLevel, regionCode } = translateItem;
			const isAlreadyInList = userData?.authList.some(
				(item: IAuthListItem) =>
					item.authType === authType && item.authLevel === authLevel && item.regionCode === regionCode,
			);
			if (isAlreadyInList) {
				setToasts({
					title: 'Is already authorized.',
					color: 'warning',
				});
				return;
			}
			const isNeedChangLevel = userData?.authList.some(
				(item: IAuthListItem) =>
					item.authType === authType && item.authLevel !== authLevel && item.regionCode === regionCode,
			);
			if (isNeedChangLevel) {
				const newList = userData?.authList.map((item: IAuthListItem) => {
					if (item.authType === authType && item.authLevel !== authLevel && item.regionCode === regionCode) {
						return translateItem;
					}
					return item;
				});
				setUserData(prev => ({ ...prev, authList: newList }));
				setToasts({
					title: 'Update item',
					color: 'success',
				});
				return;
			}
			setToasts({
				title: 'Grant item',
				color: 'success',
			});
			setUserData(prev => ({ ...prev, authList: [...prev.authList, translateItem] }));
		},
		[permissionTableState, userData, setToasts, removeToast],
	);

	// columns structure area
	const breadcrumbs = [
		{
			text: 'Settings',
			href: '#',
		},
		{
			text: 'Permissions',
			href: '/settings/permissions',
		},
		{
			text: `${id}`,
		},
	];

	const infoData = [
		{
			title: 'User Name',
			value: userData.name,
		},
		{
			title: 'User Email',
			value: isAddMode ? (
				<EuiFieldText
					placeholder="Please enter user's email"
					value={userData?.email}
					onChange={e => setUserData(prev => ({ ...prev, email: e.target.value }))}
					aria-label="Use aria labels when no actual label is in use"
				/>
			) : (
				userData.email
			),
		},
	];

	const permissionTableColumns = [
		{
			field: 'authType',
			name: 'Permission Type',
		},
		{
			field: 'authType',
			name: 'Region',
			render: (value: EAuthTypesName) =>
				value === EAuthTypesName.BONUS || value === EAuthTypesName.PAYOUT ? (
					<EuiComboBox
						isClearable={false}
						aria-label="Accessible screen reader label"
						placeholder="Select a region"
						singleSelection={{ asPlainText: true }}
						options={regionOptions}
						selectedOptions={permissionTableState[value].regionCode}
						onChange={selectedRegion => {
							setPermissionTableState(prev => {
								const newTypeState = { ...prev[value], regionCode: selectedRegion };
								return { ...prev, [value]: newTypeState };
							});
						}}
					/>
				) : (
					<span>{permissionTableState[value].regionCode[0]?.label}</span>
				),
		},
		{
			field: 'isAuthLevelOption',
			name: 'Level',
			render: (value: boolean, record: IPermissionOption) => {
				const filterOptions =
					record.authType === EAuthTypesName.TAX_RATE
						? levelOptions.filter((v: any) => v.label !== EAuthLevelName.APPROVE)
						: levelOptions;
				return value ? (
					<EuiComboBox
						isClearable={false}
						aria-label="Accessible screen reader label"
						placeholder="Select a level"
						singleSelection={{ asPlainText: true }}
						options={filterOptions}
						selectedOptions={permissionTableState[record.authType].authLevel}
						onChange={selectedLevel => {
							setPermissionTableState(prev => {
								const newTypeState = { ...prev[record.authType], authLevel: selectedLevel };
								return { ...prev, [record.authType]: newTypeState };
							});
						}}
					/>
				) : (
					'Edit'
				);
			},
		},
		{
			field: 'authType',
			name: 'Grant',
			width: '120px',
			render: (value: EAuthTypesName) => <CustomIcon type="plus" onClick={() => handleGrantPermission(value)} />,
		},
	];

	const authorizedTableColumns = [
		{
			field: 'indexNumber',
			name: '#',
			width: '60px',
		},
		{
			field: 'regionCode',
			name: 'Region',
		},
		{
			field: 'authType',
			name: 'Permission',
			width: '180px',
			render: (value: EAuthTypesValue) => {
				switch (value) {
					case EAuthTypesValue.BONUS:
						return EAuthTypesName.BONUS;
					case EAuthTypesValue.PAYOUT:
						return EAuthTypesName.PAYOUT;
					case EAuthTypesValue.SYSTEM_ADMIN:
						return EAuthTypesName.SYSTEM_ADMIN;
					case EAuthTypesValue.TAX_RATE:
						return EAuthTypesName.TAX_RATE;
					default:
						return '';
				}
			},
		},
		{
			field: 'authLevel',
			name: 'Level',
			render: (value: EAuthLevelValue) => {
				switch (value) {
					case EAuthLevelValue.APPROVE:
						return EAuthLevelName.APPROVE;
					case EAuthLevelValue.EDIT:
						return EAuthLevelName.EDIT;
					case EAuthLevelValue.READ:
						return EAuthLevelName.READ;
					default:
						return '';
				}
			},
		},
		{
			field: 'indexNumber',
			name: 'Remove',
			render: (value: number) => (
				<CustomIcon
					type="cross"
					onClick={() => {
						const newList = [...userData?.authList];
						newList.splice(value - 1, 1);
						setUserData(prev => ({ ...prev, authList: newList }));
						setToasts({
							title: 'Remove success',
							color: 'success',
						});
					}}
				/>
			),
		},
	];

	const authorizedItems = useMemo(
		() =>
			userData?.authList
				? userData?.authList?.map((item: any, key: number) => ({ ...item, indexNumber: key + 1 }))
				: [],
		[userData],
	);

	return (
		<div>
			<EuiTitle size="l">
				<h1>{isAddMode ? 'Add' : 'Edit'} Permissions</h1>
			</EuiTitle>
			<EuiSpacer />
			<EuiFlexGroup wrap>
				<EuiFlexItem>
					<Breadcrumbs max={4} breadcrumbs={breadcrumbs} aria-label="An Breadcrumbs" />
				</EuiFlexItem>
				<EuiFlexItem grow={false}>
					<EuiButton
						fill
						onClick={() => {
							isAddMode ? createUser() : updateUser();
						}}
						disabled={isPageLoading}
					>
						{isPageLoading ? <EuiLoadingSpinner size="l" /> : 'Save'}
					</EuiButton>
				</EuiFlexItem>
				<EuiFlexItem style={{ minWidth: '75%' }}>
					<DataInfo
						infoData={isAddMode ? [infoData.pop()] : infoData}
						groupCountInOneRow={isAddMode ? 1 : 2}
					/>
				</EuiFlexItem>
			</EuiFlexGroup>
			<EuiSpacer size="xl" />
			<InfoWrapper>
				<EuiFlexItem>
					<EuiTitle size="m">
						<h3>Authorized Permissions</h3>
					</EuiTitle>
					<EuiSpacer />
					<CustomTable
						tableCaption="Permissions Table"
						items={authorizedItems}
						rowHeader="firstName"
						columns={authorizedTableColumns}
					/>
				</EuiFlexItem>
				<EuiFlexItem>
					<EuiTitle size="m">
						<h3>Permissions</h3>
					</EuiTitle>
					<EuiSpacer />
					<CustomTable
						tableCaption="Permissions Table"
						items={permissionOptions}
						rowHeader="firstName"
						columns={permissionTableColumns}
					/>
				</EuiFlexItem>
			</InfoWrapper>
			{isPageLoading ? <LoadingMask /> : <></>}
		</div>
	);
};

export default Edit;

const Breadcrumbs = styled(EuiBreadcrumbs)`
	.euiLink.euiLink--subdued {
		color: blue;
	}
`;
const InfoWrapper = styled(EuiFlexGroup)`
	border: 1px solid #d3dae6;
	border-radius: 6px;
	display: flex;
	justify-content: center;
`;
const CustomIcon = styled(EuiIcon)`
	cursor: pointer;
`;
