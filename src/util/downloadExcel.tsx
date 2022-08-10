import axios from 'axios';

export const downloadCsv = async id => {
	try {
		const result = await getXLS(id);
		const url = window.URL.createObjectURL(new Blob([result.data]));
		const link = document.createElement('a');
		link.href = url;
		const fileName = result.headers['content-disposition'].split('filename=')[1];
		link.setAttribute('download', fileName);
		link.click();
		link.remove();
	} catch (err) {
		console.log({ err });
	}
};

const getXLS = (id: number) => {
	return axios.request({
		responseType: 'arraybuffer',
		url: `${process.env.REACT_APP_API_ORIGIN}/report/${id}/excel`,
		method: 'get',
		headers: {
			'Content-Type': 'blob',
		},
	});
};
