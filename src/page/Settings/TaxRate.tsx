import {
	EuiFieldNumber,
	EuiFlexGroup,
	EuiFlexItem,
	EuiFormControlLayout,
	EuiSpacer,
	EuiText,
	EuiTitle,
	EuiPagination,
	EuiLoadingSpinner,
	EuiButton,
} from '@elastic/eui';
import React, { useState, useEffect, useCallback, Fragment, useContext } from 'react';
import styled from 'styled-components';
import apiUtil from '../../util/apiUtil';
import { theme } from 'styled-tools';
import { RegionTaxList, IResponse } from 'src/util/utilModel';
import { GlobalToastContext } from '../../store/GlobalToastProvider';
import { floor } from 'lodash';

interface TaxType {
	F: string;
	L: string;
	A: string;
}

interface TaxData {
	taxFrom?: number | string;
	taxRate?: number | string;
}
interface TaxRateObj {
	[key: string]: { [key: string]: TaxData };
}

const PAY_TYPE_ARRAY = ['F', 'L', 'A'];
const TaxRate = () => {
	const { setToasts, removeToast, handleAlertApiError } = useContext(GlobalToastContext);
	const [isLoading, setIsLoading] = useState(false);
	const [taxData, setTaxData] = useState<TaxRateObj>({});
	useEffect(() => {
		fetchRegionData();
	}, []);

	const fetchRegionData = useCallback(async () => {
		setIsLoading(true);
		try {
			const result: IResponse<RegionTaxList[]> = await apiUtil.get('/region/taxRate');
			const regionData = result?.data ?? [];
			const data = regionData.reduce((obj, tax) => {
				const { code, taxList } = tax;
				const regionTax = taxList.reduce((a, b) => {
					const { payType, taxFrom, taxRate } = b;
					a[payType] = { taxFrom, taxRate: floor(+taxRate * 100, 2) };
					return a;
				}, {});
				obj[code] = regionTax;
				return obj;
			}, {}) as TaxRateObj;
			setTaxData(data);
		} catch (error) {
			handleAlertApiError(error);
		} finally {
			setIsLoading(false);
		}
	}, []);

	const onTaxDataChange = useCallback(
		(e: any, key: string) => {
			e.preventDefault();
			const target = e.target.value;
			const [taxType, payType] = e.target.name.split('-');
			const value = Number(target);

			if (value < 0 || (taxType === 'taxRate' && value > 100)) {
				return;
			}
			const decimalType = taxType === 'taxRate' ? 1 : 0;

			setTaxData({
				...taxData,
				[key]: {
					...taxData[key],
					[payType]: { ...taxData[key][payType], [taxType]: target ? floor(value, decimalType) : '' },
				},
			});
		},
		[taxData],
	);
	const onUpdateTaxData = useCallback(async () => {
		const updateData = Object.entries(taxData).map(([code, taxRegionData]) => {
			const taxList = Object.entries(taxRegionData).map(([payType, v]) => {
				const taxListObj = {};
				taxListObj['payType'] = payType;
				const { taxRate, taxFrom } = v;
				if (taxRate && !isNaN(Number(taxRate))) {
					taxListObj['taxRate'] = floor(+taxRate / 100, 3);
				}
				if (taxFrom && !isNaN(Number(taxFrom))) {
					taxListObj['taxFrom'] = taxFrom;
				}
				return taxListObj;
			});
			return { code, taxList };
		});

		try {
			const result = await apiUtil.put('/region/taxRate', updateData);
			if (result.status === 200) {
				setToasts({
					title: 'Update Tax Rate data Success!',
					color: 'success',
				});
				fetchRegionData();
			}
		} catch (error) {
			handleAlertApiError(error);
		}
	}, [taxData, removeToast]);

	if (isLoading) {
		return (
			<EuiFlexGroup justifyContent="spaceAround">
				<EuiFlexItem grow={false}>
					<EuiLoadingSpinner size="xxl" />
				</EuiFlexItem>
			</EuiFlexGroup>
		);
	}

	return (
		<>
			<EuiFlexGroup>
				<EuiFlexItem>
					<EuiTitle size="l">
						<h1>TaxRate</h1>
					</EuiTitle>
				</EuiFlexItem>
				<EuiFlexItem grow={false}>
					<EuiButton onClick={onUpdateTaxData}>SAVE</EuiButton>
				</EuiFlexItem>
			</EuiFlexGroup>
			<EuiSpacer />
			<EuiSpacer size="xl" />
			<Table>
				<thead>
					<tr>
						<TaxRateTitle colSpan={2} rowSpan={2}>
							<EuiTitle size="xs">
								<p>Region</p>
							</EuiTitle>
						</TaxRateTitle>
						<TaxRateTitle colSpan={3}>
							<EuiTitle size="xs">
								<p>Payment Type</p>
							</EuiTitle>
						</TaxRateTitle>
					</tr>
					<tr>
						<TaxRateTitle colSpan={1}>
							<EuiTitle size="xs">
								<p>Foreign</p>
							</EuiTitle>
						</TaxRateTitle>
						<TaxRateTitle colSpan={1}>
							<EuiTitle size="xs">
								<p>Local</p>
							</EuiTitle>
						</TaxRateTitle>
						<TaxRateTitle colSpan={1}>
							<EuiTitle size="xs">
								<p>Agency</p>
							</EuiTitle>
						</TaxRateTitle>
					</tr>
				</thead>
				<tbody>
					{Object.entries(taxData).map(([key, values]) => {
						return (
							<Fragment key={key}>
								<tr>
									<TaxRateTitle rowSpan={2}>
										<EuiTitle size="xs">
											<p>{key}</p>
										</EuiTitle>
									</TaxRateTitle>
									<TaxRateTitle>
										<EuiTitle size="xs">
											<p>Tax from</p>
										</EuiTitle>
									</TaxRateTitle>
									{PAY_TYPE_ARRAY.map(item => (
										<td key={`taxFrom-${item}`}>
											<EuiFieldNumber
												name={`taxFrom-${item}`}
												value={values?.[`${item}`]?.taxFrom}
												placeholder="Enter value"
												onChange={e => onTaxDataChange(e, key)}
											/>
										</td>
									))}
								</tr>
								<tr>
									<TaxRateTitle>
										<EuiTitle size="xs">
											<p>Tax rate </p>
										</EuiTitle>
									</TaxRateTitle>
									{PAY_TYPE_ARRAY.map(item => (
										<td key={`taxRate-${item}`}>
											{' '}
											<EuiFormControlLayout
												append={
													<EuiText size="xs">
														<strong>%</strong>
													</EuiText>
												}
											>
												<input
													type="number"
													name={`taxRate-${item}`}
													value={values?.[`${item}`]?.taxRate}
													className="euiFieldNumber euiFieldNumber--inGroup"
													placeholder="Enter value"
													onChange={e => onTaxDataChange(e, key)}
												/>
											</EuiFormControlLayout>
										</td>
									))}
								</tr>
							</Fragment>
						);
					})}
				</tbody>
			</Table>
		</>
	);
};

export default TaxRate;

const Table = styled.table`
	border-collapse: collapse;
	width: 100%;
	margin-bottom: 1rem;
	background-color: transparent;
	border: 1px solid #abb4c4;
	th,
	td {
		vertical-align: middle;
		padding: 0.75rem;
		border: 1px solid #abb4c4;
	}
`;

const TaxRateTitle = styled.th`
	background: #f5f7fa;
`;
