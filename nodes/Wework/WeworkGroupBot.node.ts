import {
	ICredentialDataDecryptedObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

import {sendGroupBotMessage} from "./WeworkHelper";

export class WeworkGroupBot implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Wework GroupBot',
		name: 'weworkGroupBot',
		icon: 'file:weworkGroupBot.png',
		group: ['transform'],
		version: 1,
		description: 'Message to Wework GroupBot',
		defaults: {
			name: 'Wework GroupBot',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'weworkGroupBotApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'To User',
				name: 'toUser',
				type: 'string',
				default: '@all',
				placeholder: 'Mentioned user or @all',
				description: 'Users you want to mention',
			},
			{
				displayName: 'Message type',
				name: 'messageType',
				type: 'options',
				options: [{name: 'Text', value: 'text'}, {name: 'Markdown', value: 'markdown'}],
				default: 'text',
				placeholder: 'Message type',
				description: 'The type of message you want to send',
			},
			{
				displayName: 'Message',
				name: 'message',
				type: 'string',
				default: '',
				placeholder: 'Message content',
				description: 'The content of the message you want to send',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();

		let item: INodeExecutionData;
		let credential: ICredentialDataDecryptedObject;
		let toUser: string;
		let messageType: string;
		let message: string;
		let webhookUrl: string;

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				credential = await this.getCredentials('weworkGroupBotApi', itemIndex);
				toUser = this.getNodeParameter('toUser', itemIndex, '') as string;
				messageType = this.getNodeParameter('messageType', itemIndex, '') as string;
				message = this.getNodeParameter('message', itemIndex, '') as string;
				item = items[itemIndex];

				webhookUrl = credential.webhookUrl as string;

				item.json['toUser'] = toUser;
				item.json['messageType'] = messageType;
				item.json['message'] = message;

				let response = await sendGroupBotMessage(webhookUrl, item.json);
				item.json['reponse'] = response;


			} catch (error) {
				if (this.continueOnFail()) {
					items.push({json: this.getInputData(itemIndex)[0].json, error, pairedItem: itemIndex});
				} else {
					// Adding `itemIndex` allows other workflows to handle this error
					if (error.context) {
						// If the error thrown already contains the context property,
						// only append the itemIndex
						error.context.itemIndex = itemIndex;
						throw error;
					}
					throw new NodeOperationError(this.getNode(), error, {
						itemIndex,
					});
				}
			}
		}
		return this.prepareOutputData(items);
	}
}
