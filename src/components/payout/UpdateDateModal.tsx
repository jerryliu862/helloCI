import { GlobalToastContext } from '../../store/GlobalToastProvider';
import apiUtil from '../../util/apiUtil';
import {
	EuiModal,
	EuiModalBody,
	EuiForm,
	EuiFormRow,
	EuiDatePicker,
	EuiModalFooter,
	EuiButtonEmpty,
	EuiButton,
	EuiTitle,
	useGeneratedHtmlId,
} from '@elastic/eui';
import moment from 'moment';
import React, { useContext, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const UpdateDateModal: React.FC<{
	setSelectGroupData: React.Dispatch<React.SetStateAction<any[]>>;
	setIsShowUpdateDateModal: React.Dispatch<React.SetStateAction<boolean>>;
	setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
	refreshFetchData: () => void;
	selectGroupData: any[];
}> = ({ setSelectGroupData, setIsShowUpdateDateModal, setIsLoading, refreshFetchData, selectGroupData }) => {
	const navigate = useNavigate();
	const { setToasts, handleAlertApiError } = useContext(GlobalToastContext);
	const [selectedMonth, setSelectedMonth] = useState(moment());
	const modalFormId = useGeneratedHtmlId({ prefix: 'updateDateModalForm' });

	const updateMultiDate = async () => {
		setIsLoading(true);
		try {
			const result = await apiUtil.put(`/payout/date`, {
				payDate: selectedMonth.startOf('month').format('YYYY-MM-DD'),
				idList: selectGroupData.map((item: any) => ({ id: item?.bonusID })),
			});
			setIsLoading(false);
			if (result.status === 200) {
				setToasts({
					title: `Update payout month Success!`,
					color: 'success',
				});
				setSelectGroupData([]);
				setIsShowUpdateDateModal(false);
				refreshFetchData();
			}
			if (result.status === 204) {
				setToasts({
					title: `NoData!`,
					color: 'danger',
				});
				setIsShowUpdateDateModal(false);
				navigate('/payout');
			}
		} catch (error) {
			setIsLoading(false);
			handleAlertApiError(error);
		}
	};

	return (
		<EuiModal
			onClose={() => {
				setIsShowUpdateDateModal(false);
			}}
			initialFocus="[name=popswitch]"
			style={{ width: 600 }}
		>
			<TableSubtitle size="s">
				<ModalTitle>Update multiple payout month</ModalTitle>
			</TableSubtitle>
			<EuiModalBody>
				<EuiForm id={modalFormId} component="form">
					<EuiFormRow label="Payout Month" display="columnCompressed" fullWidth>
						<EuiDatePicker
							dateFormat={'YYYY-MM'}
							selected={selectedMonth}
							calendarClassName="custom-calendar"
							onChange={(date: moment.Moment) => {
								setSelectedMonth(date);
							}}
						/>
					</EuiFormRow>
				</EuiForm>
			</EuiModalBody>

			<EuiModalFooter>
				<EuiButtonEmpty
					onClick={() => {
						setIsShowUpdateDateModal(false);
					}}
				>
					Cancel
				</EuiButtonEmpty>
				<EuiButton
					type="submit"
					form={modalFormId}
					onClick={(e: any) => {
						e.preventDefault();
						updateMultiDate();
					}}
					fill
				>
					Save
				</EuiButton>
			</EuiModalFooter>
		</EuiModal>
	);
};

export default UpdateDateModal;

const TableSubtitle = styled(EuiTitle)`
	padding: 24px;
`;

const ModalTitle = styled.h1`
	margin: 0;
`;
