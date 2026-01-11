/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class NewRelicApi implements ICredentialType {
	name = 'newRelicApi';
	displayName = 'New Relic API';
	documentationUrl = 'https://docs.newrelic.com/docs/apis/rest-api-v2/get-started/introduction-new-relic-rest-api-v2/';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Your New Relic User API Key. Find it in Account Settings > API Keys.',
		},
		{
			displayName: 'Region',
			name: 'region',
			type: 'options',
			options: [
				{
					name: 'US',
					value: 'US',
					description: 'United States region (api.newrelic.com)',
				},
				{
					name: 'EU',
					value: 'EU',
					description: 'European Union region (api.eu.newrelic.com)',
				},
			],
			default: 'US',
			required: true,
			description: 'The New Relic region your account is in',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'Api-Key': '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.region === "EU" ? "https://api.eu.newrelic.com" : "https://api.newrelic.com"}}',
			url: '/v2/applications.json',
			method: 'GET',
		},
	};
}
