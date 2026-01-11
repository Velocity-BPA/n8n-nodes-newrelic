/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { newRelicApiRequest, newRelicApiRequestAllItems } from '../../transport';
import { buildChannelConfiguration } from '../../utils';

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['notificationChannel'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a notification channel',
				action: 'Create a notification channel',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a notification channel',
				action: 'Delete a notification channel',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a single notification channel',
				action: 'Get a notification channel',
			},
			{
				name: 'Get All',
				value: 'getAll',
				description: 'Get all notification channels',
				action: 'Get all notification channels',
			},
			{
				name: 'Link to Policy',
				value: 'linkToPolicy',
				description: 'Link a channel to an alert policy',
				action: 'Link channel to policy',
			},
			{
				name: 'Unlink From Policy',
				value: 'unlinkFromPolicy',
				description: 'Unlink a channel from a policy',
				action: 'Unlink channel from policy',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a notification channel',
				action: 'Update a notification channel',
			},
		],
		default: 'getAll',
	},
	// Channel ID
	{
		displayName: 'Channel ID',
		name: 'channelId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['notificationChannel'],
				operation: ['get', 'update', 'delete', 'linkToPolicy', 'unlinkFromPolicy'],
			},
		},
		default: '',
		description: 'The ID of the notification channel',
	},
	// Policy ID for link/unlink
	{
		displayName: 'Policy ID',
		name: 'policyId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['notificationChannel'],
				operation: ['linkToPolicy', 'unlinkFromPolicy'],
			},
		},
		default: '',
		description: 'The ID of the alert policy',
	},
	// Create fields
	{
		displayName: 'Channel Name',
		name: 'name',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['notificationChannel'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Name of the notification channel',
	},
	{
		displayName: 'Channel Type',
		name: 'type',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['notificationChannel'],
				operation: ['create'],
			},
		},
		options: [
			{ name: 'Email', value: 'email' },
			{ name: 'OpsGenie', value: 'opsgenie' },
			{ name: 'PagerDuty', value: 'pagerduty' },
			{ name: 'Slack', value: 'slack' },
			{ name: 'VictorOps', value: 'victorops' },
			{ name: 'Webhook', value: 'webhook' },
		],
		default: 'email',
		description: 'Type of notification channel',
	},
	// Email configuration
	{
		displayName: 'Recipients',
		name: 'recipients',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['notificationChannel'],
				operation: ['create'],
				type: ['email'],
			},
		},
		default: '',
		description: 'Comma-separated list of email addresses',
	},
	{
		displayName: 'Include JSON Attachment',
		name: 'includeJsonAttachment',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['notificationChannel'],
				operation: ['create'],
				type: ['email'],
			},
		},
		default: false,
		description: 'Whether to include JSON payload as attachment',
	},
	// Slack configuration
	{
		displayName: 'Slack Webhook URL',
		name: 'slackUrl',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['notificationChannel'],
				operation: ['create'],
				type: ['slack'],
			},
		},
		default: '',
		description: 'Slack incoming webhook URL',
	},
	{
		displayName: 'Slack Channel',
		name: 'slackChannel',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['notificationChannel'],
				operation: ['create'],
				type: ['slack'],
			},
		},
		default: '',
		description: 'Slack channel name (optional, overrides webhook default)',
	},
	// Webhook configuration
	{
		displayName: 'Webhook URL',
		name: 'webhookUrl',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['notificationChannel'],
				operation: ['create'],
				type: ['webhook'],
			},
		},
		default: '',
		description: 'Webhook endpoint URL',
	},
	{
		displayName: 'Webhook Options',
		name: 'webhookOptions',
		type: 'collection',
		placeholder: 'Add Option',
		displayOptions: {
			show: {
				resource: ['notificationChannel'],
				operation: ['create'],
				type: ['webhook'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Auth Password',
				name: 'authPassword',
				type: 'string',
				typeOptions: { password: true },
				default: '',
				description: 'Basic auth password',
			},
			{
				displayName: 'Auth Username',
				name: 'authUsername',
				type: 'string',
				default: '',
				description: 'Basic auth username',
			},
			{
				displayName: 'Payload',
				name: 'payload',
				type: 'json',
				default: '{}',
				description: 'Custom payload template',
			},
			{
				displayName: 'Payload Type',
				name: 'payloadType',
				type: 'options',
				options: [
					{ name: 'Application/JSON', value: 'application/json' },
					{ name: 'Application/X-WWW-Form-Urlencoded', value: 'application/x-www-form-urlencoded' },
				],
				default: 'application/json',
				description: 'Content type for webhook payload',
			},
		],
	},
	// PagerDuty configuration
	{
		displayName: 'PagerDuty Service Key',
		name: 'pagerDutyServiceKey',
		type: 'string',
		typeOptions: { password: true },
		required: true,
		displayOptions: {
			show: {
				resource: ['notificationChannel'],
				operation: ['create'],
				type: ['pagerduty'],
			},
		},
		default: '',
		description: 'PagerDuty integration service key',
	},
	// OpsGenie configuration
	{
		displayName: 'OpsGenie API Key',
		name: 'opsGenieApiKey',
		type: 'string',
		typeOptions: { password: true },
		required: true,
		displayOptions: {
			show: {
				resource: ['notificationChannel'],
				operation: ['create'],
				type: ['opsgenie'],
			},
		},
		default: '',
		description: 'OpsGenie API key',
	},
	{
		displayName: 'OpsGenie Options',
		name: 'opsGenieOptions',
		type: 'collection',
		placeholder: 'Add Option',
		displayOptions: {
			show: {
				resource: ['notificationChannel'],
				operation: ['create'],
				type: ['opsgenie'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Recipients',
				name: 'recipients',
				type: 'string',
				default: '',
				description: 'Comma-separated list of recipients',
			},
			{
				displayName: 'Tags',
				name: 'tags',
				type: 'string',
				default: '',
				description: 'Comma-separated list of tags',
			},
			{
				displayName: 'Teams',
				name: 'teams',
				type: 'string',
				default: '',
				description: 'Comma-separated list of teams',
			},
		],
	},
	// VictorOps configuration
	{
		displayName: 'VictorOps Key',
		name: 'victorOpsKey',
		type: 'string',
		typeOptions: { password: true },
		required: true,
		displayOptions: {
			show: {
				resource: ['notificationChannel'],
				operation: ['create'],
				type: ['victorops'],
			},
		},
		default: '',
		description: 'VictorOps API key',
	},
	{
		displayName: 'VictorOps Route Key',
		name: 'victorOpsRouteKey',
		type: 'string',
		displayOptions: {
			show: {
				resource: ['notificationChannel'],
				operation: ['create'],
				type: ['victorops'],
			},
		},
		default: '',
		description: 'VictorOps routing key',
	},
	// Return All
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['notificationChannel'],
				operation: ['getAll'],
			},
		},
		default: false,
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		displayOptions: {
			show: {
				resource: ['notificationChannel'],
				operation: ['getAll'],
				returnAll: [false],
			},
		},
		typeOptions: {
			minValue: 1,
			maxValue: 100,
		},
		default: 50,
		description: 'Max number of results to return',
	},
	// Update fields
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				resource: ['notificationChannel'],
				operation: ['update'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'New name for the channel',
			},
		],
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<IDataObject | IDataObject[]> {
	const operation = this.getNodeParameter('operation', index) as string;

	switch (operation) {
		case 'create': {
			const name = this.getNodeParameter('name', index) as string;
			const type = this.getNodeParameter('type', index) as string;

			let configuration: IDataObject = {};

			switch (type) {
				case 'email': {
					const recipients = this.getNodeParameter('recipients', index) as string;
					const includeJsonAttachment = this.getNodeParameter('includeJsonAttachment', index, false) as boolean;
					configuration = buildChannelConfiguration('email', { recipients, includeJsonAttachment });
					break;
				}
				case 'slack': {
					const url = this.getNodeParameter('slackUrl', index) as string;
					const channel = this.getNodeParameter('slackChannel', index, '') as string;
					configuration = buildChannelConfiguration('slack', { url, channel });
					break;
				}
				case 'webhook': {
					const baseUrl = this.getNodeParameter('webhookUrl', index) as string;
					const webhookOptions = this.getNodeParameter('webhookOptions', index, {}) as IDataObject;
					configuration = buildChannelConfiguration('webhook', { baseUrl, ...webhookOptions });
					break;
				}
				case 'pagerduty': {
					const serviceKey = this.getNodeParameter('pagerDutyServiceKey', index) as string;
					configuration = buildChannelConfiguration('pagerduty', { serviceKey });
					break;
				}
				case 'opsgenie': {
					const apiKey = this.getNodeParameter('opsGenieApiKey', index) as string;
					const opsGenieOptions = this.getNodeParameter('opsGenieOptions', index, {}) as IDataObject;
					configuration = buildChannelConfiguration('opsgenie', { apiKey, ...opsGenieOptions });
					break;
				}
				case 'victorops': {
					const key = this.getNodeParameter('victorOpsKey', index) as string;
					const routeKey = this.getNodeParameter('victorOpsRouteKey', index, '') as string;
					configuration = buildChannelConfiguration('victorops', { key, routeKey });
					break;
				}
			}

			const body = {
				channel: {
					name,
					type,
					configuration,
				},
			};

			const response = await newRelicApiRequest.call(
				this,
				'POST',
				'/alerts_channels.json',
				body,
			);
			return response.channels as IDataObject;
		}

		case 'getAll': {
			const returnAll = this.getNodeParameter('returnAll', index) as boolean;

			if (returnAll) {
				return await newRelicApiRequestAllItems.call(
					this,
					'channels',
					'GET',
					'/alerts_channels.json',
				);
			} else {
				const limit = this.getNodeParameter('limit', index) as number;
				const response = await newRelicApiRequest.call(
					this,
					'GET',
					'/alerts_channels.json',
				);
				const channels = response.channels as IDataObject[];
				return channels.slice(0, limit);
			}
		}

		case 'get': {
			const channelId = this.getNodeParameter('channelId', index) as string;
			const response = await newRelicApiRequest.call(
				this,
				'GET',
				'/alerts_channels.json',
			);
			const channels = response.channels as IDataObject[];
			const channel = channels.find((c) => String(c.id) === channelId);
			if (!channel) {
				throw new Error(`Channel with ID ${channelId} not found`);
			}
			return channel;
		}

		case 'update': {
			const channelId = this.getNodeParameter('channelId', index) as string;
			const updateFields = this.getNodeParameter('updateFields', index, {}) as IDataObject;

			// Get existing channel
			const existingResponse = await newRelicApiRequest.call(
				this,
				'GET',
				'/alerts_channels.json',
			);
			const channels = existingResponse.channels as IDataObject[];
			const existingChannel = channels.find((c) => String(c.id) === channelId);

			if (!existingChannel) {
				throw new Error(`Channel with ID ${channelId} not found`);
			}

			const body = {
				channel: {
					...existingChannel,
					...(updateFields.name && { name: updateFields.name }),
				},
			};

			const response = await newRelicApiRequest.call(
				this,
				'PUT',
				`/alerts_channels/${channelId}.json`,
				body,
			);
			return response.channels as IDataObject;
		}

		case 'delete': {
			const channelId = this.getNodeParameter('channelId', index) as string;
			await newRelicApiRequest.call(
				this,
				'DELETE',
				`/alerts_channels/${channelId}.json`,
			);
			return { success: true, channelId };
		}

		case 'linkToPolicy': {
			const channelId = this.getNodeParameter('channelId', index) as string;
			const policyId = this.getNodeParameter('policyId', index) as string;

			const response = await newRelicApiRequest.call(
				this,
				'PUT',
				`/alerts_policy_channels.json`,
				{},
				{
					policy_id: policyId,
					channel_ids: channelId,
				},
			);
			return response.policy as IDataObject;
		}

		case 'unlinkFromPolicy': {
			const channelId = this.getNodeParameter('channelId', index) as string;
			const policyId = this.getNodeParameter('policyId', index) as string;

			await newRelicApiRequest.call(
				this,
				'DELETE',
				`/alerts_policy_channels.json`,
				{},
				{
					policy_id: policyId,
					channel_id: channelId,
				},
			);
			return { success: true, channelId, policyId };
		}

		default:
			throw new Error(`Operation ${operation} is not supported`);
	}
}
