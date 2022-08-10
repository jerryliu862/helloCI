import { EuiConfirmModal, EuiTitle } from '@elastic/eui';
import React from 'react';
import styled from 'styled-components';

type ReactState<T> = React.Dispatch<React.SetStateAction<T>>;

const MarkPaidModal: React.FC<{ setShowMarkModal: ReactState<boolean>; updatePaidStatus: () => void }> = ({
	setShowMarkModal,
	updatePaidStatus,
}) => {
	return (
		<EuiConfirmModal
			title={
				<TableSubtitle size="s">
					<ModalTitle>Mark as Group?</ModalTitle>
				</TableSubtitle>
			}
			onCancel={() => {
				setShowMarkModal(false);
			}}
			onConfirm={updatePaidStatus}
			cancelButtonText="Cancel"
			confirmButtonText="Confirm"
			buttonColor="danger"
		>
			<p>You can&apos;t recover marked data</p>
		</EuiConfirmModal>
	);
};

export default MarkPaidModal;

const TableSubtitle = styled(EuiTitle)`
	margin-bottom: 20px;
`;

const ModalTitle = styled.h1`
	margin: 0;
`;
