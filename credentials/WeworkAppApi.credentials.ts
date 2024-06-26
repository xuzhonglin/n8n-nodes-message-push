import {
	// IAuthenticateGeneric, ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class WeworkAppApi implements ICredentialType {
	name = 'weworkAppApi';
	displayName = 'Wework App Api';
	properties: INodeProperties[] = [
		{
			displayName: 'Corp ID',
			name: 'corpId',
			type: 'string',
			default: '',
		},
		{
			displayName: 'Agent ID',
			name: 'agentId',
			type: 'string',
			default: '',
		},
		{
			displayName: 'Secret',
			name: 'secret',
			type: 'string',
			default: '',
		}
	];
}
