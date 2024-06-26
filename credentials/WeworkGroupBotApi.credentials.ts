import {
	// IAuthenticateGeneric, ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class WeworkGroupBotApi implements ICredentialType {
	name = 'weworkGroupBotApi';
	displayName = 'Wework GroupBot Api';
	properties: INodeProperties[] = [
		{
			displayName: 'Webhook URL',
			name: 'webhookUrl',
			type: 'string',
			default: '',
		}
	];
}
