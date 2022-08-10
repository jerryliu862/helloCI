import { GlobalToastContext } from '../../store/GlobalToastProvider';
import apiUtil from '../../util/apiUtil';
import { EBonusType, EPayoutTabName, ICampaignRank, IResponse } from '../../util/utilModel';
import {
	EuiModal,
	EuiModalBody,
	EuiForm,
	EuiFormRow,
	EuiSelect,
	EuiDatePicker,
	EuiTextArea,
	EuiModalFooter,
	EuiButtonEmpty,
	EuiButton,
	EuiTitle,
	useGeneratedHtmlId,
	EuiComboBox,
} from '@elastic/eui';
import moment from 'moment';
import { uniqBy, isEmpty } from 'lodash';
import React, { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import NumberFormatInput from '../common/NumberFormatInput';
import { useNavigate } from 'react-router-dom';

const options = [
	{ value: EBonusType.ADDON, text: 'Addon' },
	{ value: EBonusType.DEDUCTION, text: 'Deduction' },
	{ value: EBonusType.TRANSPORTATION, text: 'Transportation' },
];

const AddAdjustmentModal: React.FC<{
	setIsShowAdjustmentModal: React.Dispatch<React.SetStateAction<boolean>>;
	selectData?: any;
	setRegionCode?: React.Dispatch<React.SetStateAction<string>>;
	refresh?: () => void;
	targetCurrency?: any;
}> = ({ setIsShowAdjustmentModal, refresh, selectData, setRegionCode, targetCurrency }) => {
	const navigate = useNavigate();
	const { setToasts, handleAlertApiError } = useContext(GlobalToastContext);
	const modalFormId = useGeneratedHtmlId({ prefix: 'modalForm' });
	const basicSelectId = useGeneratedHtmlId({ prefix: 'basicSelect' });
	const [rankData, setRankData] = useState<ICampaignRank[]>([]);
	const [selectedOptions, setSelected] = useState({
		id: [],
		campaign: [],
		bonusType: null,
		payDate: moment(),
		amount: null,
		remark: '',
		bonusID: 0,
	});

	// useEffect(() => {
	// 	if (!rankID && !isEdit) {
	// 		setSelected({ ...selectedOptions, id: [] });
	// 	}
	// }, [selectedOptions.campaign]);

	const selectedCampaignID = (selectedOptions.campaign[0]?.label || '').split(' ')[0];
	const selectedUserID = (selectedOptions.id[0]?.label || '').split(' ')[1];
	const selectedRankData = rankData.find(
		({ userID, campaignID }) => userID === selectedUserID && Number(selectedCampaignID) === campaignID,
	);
	const rankID = selectedRankData?.rankID;
	const currency = selectedRankData?.campaignCurrency;
	const isEdit = !isEmpty(selectData);
	const isDisabled =
		selectedOptions.bonusType == null || !selectedOptions.amount || !selectedCampaignID || !selectedUserID;
	const [adjustMentOptions, setAdjustMentOptions] = useState(isEdit ? options : []);
	const filterCampaignData = rankData.filter(
		({ campaignID }) => isEmpty(selectedOptions.campaign) || campaignID === Number(selectedCampaignID),
	);
	const filterIdData = rankData.filter(({ userID }) => isEmpty(selectedOptions.id) || userID === selectedUserID);
	const idArray = !isEdit ? filterCampaignData.map(({ userID, openID }) => ({ label: `${openID} ${userID}` })) : [];
	const isBonus = [EBonusType.FIXED_BONUS, EBonusType.VARIABLE_BONUS].includes(selectedOptions.bonusType);
	const campaignArray = !isEdit
		? uniqBy(
				filterIdData.map(({ campaignID, campaignTitle }) => ({ label: `${campaignID} ${campaignTitle}` })),
				'label',
		  )
		: [];
	currency && setRegionCode?.(currency);
	useEffect(() => {
		fetchRankData();
	}, []);

	useEffect(() => {
		if (isBonus) {
			setAdjustMentOptions([
				{
					value: selectedOptions.bonusType,
					text: selectedOptions.bonusType === EBonusType.FIXED_BONUS ? 'Fixed Bonus' : 'Variable Bonus',
				},
			]);
		}
	}, [selectedOptions]);

	useEffect(() => {
		if (!isEmpty(selectData)) {
			const { openID, userID, campaignTitle, bonusType, campaignID, amount, remark, bonusID, payDate } =
				selectData;

			setSelected({
				...selectedOptions,
				id: [{ label: `${openID} ${userID}` }],
				campaign: [{ label: `${campaignID} ${campaignTitle}` }],
				payDate: payDate ? moment(payDate) : moment(),
				amount,
				bonusType,
				remark,
				bonusID,
			});
		}
	}, [selectData]);

	const fetchRankData = async () => {
		try {
			const result: IResponse<ICampaignRank[]> = await apiUtil.get('/campaign/rank');
			setRankData(result.data);
		} catch (error) {
			handleAlertApiError(error);
		}
	};

	const saveData = async () => {
		const { payDate, remark, amount, bonusType, bonusID } = selectedOptions;
		const url = '/payout/adjustment';

		const requestBody = {
			rankID,
			payDate: payDate.startOf('month').format('YYYY-MM-DD'),
			remark,
			amount: bonusType === EBonusType.DEDUCTION ? -amount : amount,
			bonusType,
			bonusID,
		};

		if (isEdit && isBonus) {
			requestBody.amount = 0;
		}

		try {
			const result = await apiUtil.put(url, requestBody);
			if (result.status === 200) {
				setToasts({
					title: 'Approval Success!',
					color: 'success',
				});
				refresh?.();
				setIsShowAdjustmentModal(false);
			}
			if (result.status === 204) {
				setToasts({
					title: `NoData!`,
					color: 'danger',
				});
				setIsShowAdjustmentModal(false);
				navigate('/payout');
			}
		} catch (error) {
			handleAlertApiError(error);
		}
	};

	return (
		<EuiModal
			onClose={() => {
				setIsShowAdjustmentModal(false);
			}}
			initialFocus="[name=popswitch]"
			style={{ width: 600 }}
		>
			<TableSubtitle size="s">
				<ModalTitle>{isEdit ? 'Edit' : 'Add'} Adjustment</ModalTitle>
			</TableSubtitle>
			<EuiModalBody>
				<EuiForm id={modalFormId} component="form">
					<EuiFormRow label="User" display="columnCompressed" fullWidth>
						<EuiComboBox
							aria-label="Accessible screen reader label"
							placeholder="Search by User ID ,Open ID"
							singleSelection={{ asPlainText: true }}
							options={idArray}
							selectedOptions={selectedOptions.id}
							onChange={(selectedOptions: any) => {
								setSelected(prev => ({ ...prev, id: selectedOptions }));
							}}
							isDisabled={isEdit}
						/>
					</EuiFormRow>
					<EuiFormRow label="Campaign" display="columnCompressed" fullWidth>
						<EuiComboBox
							aria-label="Accessible screen reader label"
							placeholder="Search by Campaign ID ,title"
							singleSelection={{ asPlainText: true }}
							options={campaignArray}
							selectedOptions={selectedOptions.campaign}
							onChange={(selectedOptions: any) => {
								setSelected(prev => ({ ...prev, campaign: selectedOptions }));
							}}
							isDisabled={isEdit}
						/>
					</EuiFormRow>
					<EuiFormRow label="Adjustment Type" display="columnCompressed" fullWidth>
						<EuiSelect
							id={basicSelectId}
							options={adjustMentOptions}
							aria-label="Use aria labels when no actual label is in use"
							onChange={(e: any) => {
								setSelected(prev => ({ ...prev, bonusType: Number(e.target.value) }));
							}}
							onFocus={() => !isEdit && setAdjustMentOptions(options)}
							defaultValue={selectedOptions.bonusType}
							disabled={isEdit && isBonus}
						/>
					</EuiFormRow>
					<EuiFormRow label="Payout Month" display="columnCompressed" fullWidth>
						<EuiDatePicker
							dateFormat={'YYYY-MM'}
							selected={selectedOptions.payDate}
							calendarClassName="custom-calendar"
							onChange={(date: moment.Moment) => {
								setSelected(prev => ({ ...prev, payDate: date }));
							}}
						/>
					</EuiFormRow>
					<EuiFormRow label="Amount" display="columnCompressed" fullWidth>
						<NumberFormatInput
							disabled={isEdit && isBonus}
							tableValue={`${selectedOptions.amount || ''}`}
							handleValueChange={(value: string) => {
								setSelected(prev => ({ ...prev, amount: Number(value) }));
							}}
							targetCurrency={targetCurrency}
						/>
					</EuiFormRow>
					<EuiFormRow label="Remark" display="columnCompressed" fullWidth>
						<EuiTextArea
							placeholder="Placeholder text"
							aria-label="Use aria labels when no actual label is in use"
							value={selectedOptions.remark}
							onChange={(e: any) => {
								setSelected(prev => ({ ...prev, remark: e.target.value }));
							}}
						/>
					</EuiFormRow>
				</EuiForm>
			</EuiModalBody>

			<EuiModalFooter>
				<EuiButtonEmpty
					onClick={() => {
						setIsShowAdjustmentModal(false);
					}}
				>
					Cancel
				</EuiButtonEmpty>
				<EuiButton
					type="submit"
					form={modalFormId}
					onClick={e => {
						e.preventDefault();
						saveData();
					}}
					fill
					disabled={!isEdit && !isBonus && isDisabled}
				>
					Save
				</EuiButton>
			</EuiModalFooter>
		</EuiModal>
	);
};

export default AddAdjustmentModal;

const TableSubtitle = styled(EuiTitle)`
	padding: 24px;
`;
const ModalTitle = styled.h1`
	margin: 0;
`;
