import axios from "axios";
import LocalCache from "../Common/LocalCache";
import {ICredentialDataDecryptedObject} from "n8n-workflow/dist/Interfaces";

const COMMON_HEADERS = {
	'User-Agent': 'Mozilla/5.0 N8N',
}
const GET = 'GET'
const POST = 'POST'
const Cache = new LocalCache()

export const getAccessToken = async (corpId: string, corpSecret: string): Promise<string> => {
	const key = `ACCESS_TOKEN_${corpId.toUpperCase()}_${corpSecret.toUpperCase()}`
	let accessToken = await Cache.get(key)
	// let accessToken
	console.log(accessToken)
	if (accessToken != null) {
		console.log('Cache Hit', key)
		return accessToken
	}
	const url = `https://qyapi.weixin.qq.com/cgi-bin/gettoken?corpid=${corpId}&corpsecret=${corpSecret}`
	const response = await http(GET, url);
	console.log(response)
	if (response?.access_token) {
		accessToken = response.access_token
		Cache.set(key, accessToken, 7000)
	}
	return accessToken
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

export const sendGroupBotMessage = async (url: string, data: any): Promise<any> => {
	const type = data["messageType"];
	const payload = {
		msgtype: type,
		text: {
			content: data["message"],
			mentioned_list: data["toUser"],
		},
		markdown: {
			content: data["message"],
			mentioned_list: data["toUser"],
		}
	}
	return http(POST, url, {}, payload);
}

export const sendAppMessage = async (credential: ICredentialDataDecryptedObject, data: any): Promise<any> => {
	console.log(credential)
	console.log(data)

	const {toUser, messageType, message} = data
	console.log(toUser, messageType, message)
	const corpId = credential.corpId as string
	const corpSecret = credential.secret as string
	const agentId = credential.agentId as number
	const accessToken = await getAccessToken(corpId, corpSecret)
	const url = `https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${accessToken}`
	let payload: any = {
		"touser": toUser,
		"msgtype": messageType,
		"agentid": agentId,
	}
	if (messageType == 'text') {
		payload = {
			"text": {
				"content": message
			}, ...payload
		}
	} else if (messageType == 'markdown') {
		payload = {
			"markdown": {
				"content": message
			}, ...payload
		}
	} else if (messageType == 'textcard') {
		payload = {
			"textcard": {
				"title": data.title ? data.title : '消息通知',
				"description": message,
				"url": data.url ? data.url : '',
				"btntxt": data.btntxt ? data.btntxt : '详情'
			}, ...payload
		}
	}
	return await http(POST, url, {}, payload)
}
