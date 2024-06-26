import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

import {sendAppMessage} from "./WeworkHelper";

export class WeworkApp implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Wework App',
		name: 'weworkApp',
		// icon: 'file:weworkGroupBot.png',
		group: ['transform'],
		version: 1,
		description: 'Message to Wework App',
		defaults: {
			name: 'Wework App',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'weworkAppApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'To User',
				name: 'toUser',
				type: 'string',
				default: '',
				placeholder: 'User Id',
				description: 'Users you want to send message',
			},
			{
				displayName: 'Message type',
				name: 'messageType',
				type: 'options',
				options: [
					{name: 'Text', value: 'text'},
					{name: 'Markdown', value: 'markdown'},
					{name: 'TextCard', value: 'textcard'}
				],
				default: 'text',
				placeholder: 'Message type',
				description: 'The type of message you want to send',
			},
			{
				displayName: 'Message Title',
				name: 'title',
				type: 'string',
				default: '',
				placeholder: 'Message title',
				description: 'The title of the message you want to send',
				displayOptions: {
					show: {
						messageType: ['textcard']
					}
				}
			},
			{
				displayName: 'Message',
				name: 'message',
				type: 'string',
				default: '',
				placeholder: 'Message content',
				description: 'The content of the message you want to send',
			},
			{
				displayName: 'Url',
				name: 'url',
				type: 'string',
				default: '',
				placeholder: 'Message url',
				description: 'The url of the message you want to send',
				displayOptions: {
					show: {
						messageType: ['textcard']
					}
				}
			}
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();

		let item: INodeExecutionData;

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const data = {
					toUser: this.getNodeParameter('toUser', itemIndex, '') as string,
					messageType: this.getNodeParameter('messageType', itemIndex, '') as string,
					title: this.getNodeParameter('title', itemIndex, '') as string,
					message: this.getNodeParameter('message', itemIndex, '') as string,
					url: this.getNodeParameter('url', itemIndex, '') as string,
				}
				item = items[itemIndex];
				const credential = await this.getCredentials('weworkAppApi', itemIndex)
				const response = await sendAppMessage(credential, data);
				item.json['response'] = response;

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
