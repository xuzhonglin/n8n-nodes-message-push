import axios from "axios";

const WORKDAY_API_URL = 'https://timor.tech/api/holiday/info/';
const COMMON_HEADERS = {
	'User-Agent': 'Mozilla/5.0 N8N',
}

export const http = async (method: string, url: string, params: any = {}, data: any = {}): Promise<any> => {
	const response = await axios({
		url,
		method,
		headers: COMMON_HEADERS,
		params,
		data,
	});
	return response.data;
}

export const formateDate = (date: Date): string => {
	const year = date.getFullYear();
	const month = ('0' + (date.getMonth() + 1)).slice(-2);
	const day = ('0' + date.getDate()).slice(-2);
	return `${year}-${month}-${day}`;
}

export const isWorkday = async (date: string): Promise<any> => {
	const url = `${WORKDAY_API_URL}${date}`;
	const response = await http('GET', url);
	console.log(response);
	return response?.type;
}
