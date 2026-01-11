/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IDataObject,
	IExecuteFunctions,
	INodeProperties,
} from 'n8n-workflow';

import { getSyntheticsBaseUrl } from '../../transport';

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['synthetics'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a synthetic monitor',
				action: 'Create a synthetic monitor',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a synthetic monitor',
				action: 'Delete a synthetic monitor',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a synthetic monitor',
				action: 'Get a synthetic monitor',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many synthetic monitors',
				action: 'Get many synthetic monitors',
			},
			{
				name: 'Get Locations',
				value: 'getLocations',
				description: 'Get available monitoring locations',
				action: 'Get monitoring locations',
			},
			{
				name: 'Get Results',
				value: 'getResults',
				description: 'Get monitor results',
				action: 'Get monitor results',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a synthetic monitor',
				action: 'Update a synthetic monitor',
			},
		],
		default: 'getAll',
	},
	// Monitor ID - for get, update, delete, getResults
	{
		displayName: 'Monitor ID',
		name: 'monitorId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['synthetics'],
				operation: ['get', 'update', 'delete', 'getResults'],
			},
		},
		description: 'UUID of the synthetic monitor',
	},
	// Create fields
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['synthetics'],
				operation: ['create'],
			},
		},
		description: 'Name of the synthetic monitor',
	},
	{
		displayName: 'Type',
		name: 'type',
		type: 'options',
		required: true,
		default: 'SIMPLE',
		displayOptions: {
			show: {
				resource: ['synthetics'],
				operation: ['create'],
			},
		},
		options: [
			{
				name: 'Simple (Ping)',
				value: 'SIMPLE',
			},
			{
				name: 'Browser',
				value: 'BROWSER',
			},
			{
				name: 'Scripted API',
				value: 'SCRIPT_API',
			},
			{
				name: 'Scripted Browser',
				value: 'SCRIPT_BROWSER',
			},
		],
		description: 'Type of synthetic monitor',
	},
	{
		displayName: 'Frequency (Minutes)',
		name: 'frequency',
		type: 'options',
		required: true,
		default: 10,
		displayOptions: {
			show: {
				resource: ['synthetics'],
				operation: ['create'],
			},
		},
		options: [
			{ name: '1 Minute', value: 1 },
			{ name: '5 Minutes', value: 5 },
			{ name: '10 Minutes', value: 10 },
			{ name: '15 Minutes', value: 15 },
			{ name: '30 Minutes', value: 30 },
			{ name: '60 Minutes', value: 60 },
			{ name: '360 Minutes (6 hours)', value: 360 },
			{ name: '720 Minutes (12 hours)', value: 720 },
			{ name: '1440 Minutes (24 hours)', value: 1440 },
		],
		description: 'How frequently the monitor runs',
	},
	{
		displayName: 'URI',
		name: 'uri',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['synthetics'],
				operation: ['create'],
				type: ['SIMPLE', 'BROWSER'],
			},
		},
		placeholder: 'https://example.com',
		description: 'URL to monitor',
	},
	{
		displayName: 'Locations',
		name: 'locations',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['synthetics'],
				operation: ['create'],
			},
		},
		placeholder: 'AWS_US_EAST_1, AWS_EU_WEST_1',
		description: 'Comma-separated list of location codes where monitor will run',
	},
	{
		displayName: 'Status',
		name: 'status',
		type: 'options',
		required: true,
		default: 'ENABLED',
		displayOptions: {
			show: {
				resource: ['synthetics'],
				operation: ['create'],
			},
		},
		options: [
			{ name: 'Enabled', value: 'ENABLED' },
			{ name: 'Muted', value: 'MUTED' },
			{ name: 'Disabled', value: 'DISABLED' },
		],
		description: 'Status of the monitor',
	},
	// Create additional options
	{
		displayName: 'Additional Options',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		displayOptions: {
			show: {
				resource: ['synthetics'],
				operation: ['create'],
			},
		},
		options: [
			{
				displayName: 'SLA Threshold',
				name: 'slaThreshold',
				type: 'number',
				default: 7,
				description: 'SLA threshold in seconds',
			},
			{
				displayName: 'Validation String',
				name: 'validationString',
				type: 'string',
				default: '',
				description: 'String that must appear in the response',
			},
			{
				displayName: 'Verify SSL',
				name: 'verifySsl',
				type: 'boolean',
				default: true,
				description: 'Whether to verify SSL certificate',
			},
			{
				displayName: 'Bypass HEAD Request',
				name: 'bypassHEADRequest',
				type: 'boolean',
				default: false,
				description: 'Whether to bypass HEAD request (for SIMPLE monitors)',
			},
			{
				displayName: 'Treat Redirect as Failure',
				name: 'treatRedirectAsFailure',
				type: 'boolean',
				default: false,
				description: 'Whether to treat redirects as failures',
			},
		],
	},
	// Script for scripted monitors
	{
		displayName: 'Script',
		name: 'script',
		type: 'string',
		typeOptions: {
			rows: 10,
		},
		default: '',
		displayOptions: {
			show: {
				resource: ['synthetics'],
				operation: ['create'],
				type: ['SCRIPT_API', 'SCRIPT_BROWSER'],
			},
		},
		description: 'The script to run for scripted monitors',
	},
	// Update fields
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		default: {},
		displayOptions: {
			show: {
				resource: ['synthetics'],
				operation: ['update'],
			},
		},
		options: [
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'New name for the monitor',
			},
			{
				displayName: 'Frequency (Minutes)',
				name: 'frequency',
				type: 'options',
				default: 10,
				options: [
					{ name: '1 Minute', value: 1 },
					{ name: '5 Minutes', value: 5 },
					{ name: '10 Minutes', value: 10 },
					{ name: '15 Minutes', value: 15 },
					{ name: '30 Minutes', value: 30 },
					{ name: '60 Minutes', value: 60 },
					{ name: '360 Minutes', value: 360 },
					{ name: '720 Minutes', value: 720 },
					{ name: '1440 Minutes', value: 1440 },
				],
				description: 'How frequently the monitor runs',
			},
			{
				displayName: 'URI',
				name: 'uri',
				type: 'string',
				default: '',
				description: 'URL to monitor',
			},
			{
				displayName: 'Locations',
				name: 'locations',
				type: 'string',
				default: '',
				description: 'Comma-separated list of location codes',
			},
			{
				displayName: 'Status',
				name: 'status',
				type: 'options',
				default: 'ENABLED',
				options: [
					{ name: 'Enabled', value: 'ENABLED' },
					{ name: 'Muted', value: 'MUTED' },
					{ name: 'Disabled', value: 'DISABLED' },
				],
				description: 'Status of the monitor',
			},
			{
				displayName: 'SLA Threshold',
				name: 'slaThreshold',
				type: 'number',
				default: 7,
				description: 'SLA threshold in seconds',
			},
		],
	},
	// GetAll options
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['synthetics'],
				operation: ['getAll'],
			},
		},
		description: 'Whether to return all results or only up to a given limit',
	},
	{
		displayName: 'Limit',
		name: 'limit',
		type: 'number',
		default: 50,
		displayOptions: {
			show: {
				resource: ['synthetics'],
				operation: ['getAll'],
				returnAll: [false],
			},
		},
		typeOptions: {
			minValue: 1,
		},
		description: 'Max number of results to return',
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<IDataObject | IDataObject[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	let responseData: IDataObject | IDataObject[];

	const credentials = await this.getCredentials('newRelicApi');
	const region = credentials.region as string;
	const syntheticsBaseUrl = getSyntheticsBaseUrl(region);

	if (operation === 'create') {
		const name = this.getNodeParameter('name', index) as string;
		const type = this.getNodeParameter('type', index) as string;
		const frequency = this.getNodeParameter('frequency', index) as number;
		const locationsStr = this.getNodeParameter('locations', index) as string;
		const status = this.getNodeParameter('status', index) as string;
		const additionalOptions = this.getNodeParameter('additionalOptions', index) as IDataObject;

		const locations = locationsStr.split(',').map((l) => l.trim()).filter(Boolean);

		const body: IDataObject = {
			name,
			type,
			frequency,
			locations,
			status,
		};

		// Add URI for SIMPLE and BROWSER types
		if (type === 'SIMPLE' || type === 'BROWSER') {
			body.uri = this.getNodeParameter('uri', index) as string;
		}

		// Add script for scripted monitors
		if (type === 'SCRIPT_API' || type === 'SCRIPT_BROWSER') {
			const script = this.getNodeParameter('script', index, '') as string;
			if (script) {
				body.script = {
					scriptText: Buffer.from(script).toString('base64'),
				};
			}
		}

		// Add additional options
		if (additionalOptions.slaThreshold !== undefined) {
			body.slaThreshold = additionalOptions.slaThreshold;
		}
		if (additionalOptions.validationString) {
			body.options = body.options || {};
			(body.options as IDataObject).validationString = additionalOptions.validationString;
		}
		if (additionalOptions.verifySsl !== undefined) {
			body.options = body.options || {};
			(body.options as IDataObject).verifySsl = additionalOptions.verifySsl;
		}
		if (additionalOptions.bypassHEADRequest !== undefined) {
			body.options = body.options || {};
			(body.options as IDataObject).bypassHEADRequest = additionalOptions.bypassHEADRequest;
		}
		if (additionalOptions.treatRedirectAsFailure !== undefined) {
			body.options = body.options || {};
			(body.options as IDataObject).treatRedirectAsFailure = additionalOptions.treatRedirectAsFailure;
		}

		// Create monitor using Synthetics API
		const options = {
			method: 'POST' as const,
			uri: `${syntheticsBaseUrl}/v3/monitors`,
			headers: {
				'Api-Key': credentials.apiKey as string,
				'Content-Type': 'application/json',
			},
			body,
			json: true,
		};

		responseData = await this.helpers.request(options);
	} else if (operation === 'getAll') {
		const returnAll = this.getNodeParameter('returnAll', index) as boolean;
		const limit = this.getNodeParameter('limit', index, 50) as number;

		const options = {
			method: 'GET' as const,
			uri: `${syntheticsBaseUrl}/v3/monitors`,
			headers: {
				'Api-Key': credentials.apiKey as string,
			},
			json: true,
		};

		const response = await this.helpers.request(options) as IDataObject;
		let monitors = (response.monitors || []) as IDataObject[];

		if (!returnAll && monitors.length > limit) {
			monitors = monitors.slice(0, limit);
		}

		responseData = monitors;
	} else if (operation === 'get') {
		const monitorId = this.getNodeParameter('monitorId', index) as string;

		const options = {
			method: 'GET' as const,
			uri: `${syntheticsBaseUrl}/v3/monitors/${monitorId}`,
			headers: {
				'Api-Key': credentials.apiKey as string,
			},
			json: true,
		};

		responseData = await this.helpers.request(options);
	} else if (operation === 'update') {
		const monitorId = this.getNodeParameter('monitorId', index) as string;
		const updateFields = this.getNodeParameter('updateFields', index) as IDataObject;

		// First get the current monitor
		const getOptions = {
			method: 'GET' as const,
			uri: `${syntheticsBaseUrl}/v3/monitors/${monitorId}`,
			headers: {
				'Api-Key': credentials.apiKey as string,
			},
			json: true,
		};

		const currentMonitor = await this.helpers.request(getOptions) as IDataObject;

		// Merge updates
		const body: IDataObject = { ...currentMonitor };

		if (updateFields.name) {
			body.name = updateFields.name;
		}
		if (updateFields.frequency !== undefined) {
			body.frequency = updateFields.frequency;
		}
		if (updateFields.uri) {
			body.uri = updateFields.uri;
		}
		if (updateFields.locations) {
			const locations = (updateFields.locations as string).split(',').map((l) => l.trim()).filter(Boolean);
			body.locations = locations;
		}
		if (updateFields.status) {
			body.status = updateFields.status;
		}
		if (updateFields.slaThreshold !== undefined) {
			body.slaThreshold = updateFields.slaThreshold;
		}

		// Remove read-only fields
		delete body.id;
		delete body.createdAt;
		delete body.modifiedAt;

		const options = {
			method: 'PUT' as const,
			uri: `${syntheticsBaseUrl}/v3/monitors/${monitorId}`,
			headers: {
				'Api-Key': credentials.apiKey as string,
				'Content-Type': 'application/json',
			},
			body,
			json: true,
		};

		responseData = await this.helpers.request(options);
	} else if (operation === 'delete') {
		const monitorId = this.getNodeParameter('monitorId', index) as string;

		const options = {
			method: 'DELETE' as const,
			uri: `${syntheticsBaseUrl}/v3/monitors/${monitorId}`,
			headers: {
				'Api-Key': credentials.apiKey as string,
			},
			json: true,
		};

		await this.helpers.request(options);
		responseData = { success: true, monitorId };
	} else if (operation === 'getLocations') {
		const options = {
			method: 'GET' as const,
			uri: `${syntheticsBaseUrl}/v1/locations`,
			headers: {
				'Api-Key': credentials.apiKey as string,
			},
			json: true,
		};

		responseData = await this.helpers.request(options);
	} else if (operation === 'getResults') {
		const monitorId = this.getNodeParameter('monitorId', index) as string;

		const options = {
			method: 'GET' as const,
			uri: `${syntheticsBaseUrl}/v3/monitors/${monitorId}/results`,
			headers: {
				'Api-Key': credentials.apiKey as string,
			},
			json: true,
		};

		const response = await this.helpers.request(options) as IDataObject;
		responseData = (response.results || response) as IDataObject;
	} else {
		throw new Error(`Operation "${operation}" is not supported`);
	}

	return responseData;
}
