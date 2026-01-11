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

import { newRelicApiRequest, newRelicApiRequestAllItems } from '../../transport';

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['server'],
			},
		},
		options: [
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a server',
				action: 'Delete a server',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a server by ID',
				action: 'Get a server',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many servers',
				action: 'Get many servers',
			},
			{
				name: 'Get Metric Data',
				value: 'getMetricData',
				description: 'Get metric data for a server',
				action: 'Get server metric data',
			},
			{
				name: 'Get Metric Names',
				value: 'getMetricNames',
				description: 'Get available metric names for a server',
				action: 'Get server metric names',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a server name',
				action: 'Update a server',
			},
		],
		default: 'getAll',
	},
	// Server ID - for get, update, delete, getMetricNames, getMetricData
	{
		displayName: 'Server ID',
		name: 'serverId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['get', 'update', 'delete', 'getMetricNames', 'getMetricData'],
			},
		},
		description: 'ID of the server',
	},
	// Update fields
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['update'],
			},
		},
		description: 'New name for the server',
	},
	// Metric Names filter
	{
		displayName: 'Name Filter',
		name: 'nameFilter',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['getMetricNames'],
			},
		},
		placeholder: 'CPU',
		description: 'Filter metric names (partial match)',
	},
	// Metric Data fields
	{
		displayName: 'Metric Names',
		name: 'metricNames',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['getMetricData'],
			},
		},
		placeholder: 'System/CPU/User/percent, System/Memory/Used/bytes',
		description: 'Comma-separated list of metric names to retrieve',
	},
	{
		displayName: 'Metric Values',
		name: 'metricValues',
		type: 'string',
		default: '',
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['getMetricData'],
			},
		},
		placeholder: 'average_value, call_count',
		description: 'Comma-separated list of metric values to retrieve (leave empty for all)',
	},
	{
		displayName: 'Time Range',
		name: 'timeRange',
		type: 'collection',
		placeholder: 'Add Time Range',
		default: {},
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['getMetricData'],
			},
		},
		options: [
			{
				displayName: 'From',
				name: 'from',
				type: 'dateTime',
				default: '',
				description: 'Start of the time range',
			},
			{
				displayName: 'To',
				name: 'to',
				type: 'dateTime',
				default: '',
				description: 'End of the time range',
			},
			{
				displayName: 'Period',
				name: 'period',
				type: 'number',
				default: 60,
				description: 'Period of timeslices in seconds',
			},
			{
				displayName: 'Summarize',
				name: 'summarize',
				type: 'boolean',
				default: true,
				description: 'Whether to return summarized data or raw timeslices',
			},
		],
	},
	// GetAll filters
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['server'],
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
				resource: ['server'],
				operation: ['getAll'],
				returnAll: [false],
			},
		},
		typeOptions: {
			minValue: 1,
		},
		description: 'Max number of results to return',
	},
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		default: {},
		displayOptions: {
			show: {
				resource: ['server'],
				operation: ['getAll'],
			},
		},
		options: [
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Filter by server name (partial match)',
			},
			{
				displayName: 'Host',
				name: 'host',
				type: 'string',
				default: '',
				description: 'Filter by hostname',
			},
			{
				displayName: 'IDs',
				name: 'ids',
				type: 'string',
				default: '',
				description: 'Comma-separated list of server IDs',
			},
			{
				displayName: 'Labels',
				name: 'labels',
				type: 'string',
				default: '',
				description: 'Filter by labels (comma-separated)',
			},
			{
				displayName: 'Reported',
				name: 'reported',
				type: 'boolean',
				default: true,
				description: 'Filter by reporting status',
			},
		],
	},
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<IDataObject | IDataObject[]> {
	const operation = this.getNodeParameter('operation', index) as string;
	let responseData: IDataObject | IDataObject[];

	if (operation === 'getAll') {
		const returnAll = this.getNodeParameter('returnAll', index) as boolean;
		const filters = this.getNodeParameter('filters', index) as IDataObject;

		const qs: IDataObject = {};

		// Build filter query parameters
		if (filters.name) {
			qs['filter[name]'] = filters.name;
		}
		if (filters.host) {
			qs['filter[host]'] = filters.host;
		}
		if (filters.ids) {
			qs['filter[ids]'] = filters.ids;
		}
		if (filters.labels) {
			qs['filter[labels]'] = filters.labels;
		}
		if (filters.reported !== undefined) {
			qs['filter[reported]'] = filters.reported;
		}

		if (returnAll) {
			responseData = await newRelicApiRequestAllItems.call(
				this,
				'servers',
				'GET',
				'/servers.json',
				undefined,
				qs,
			);
		} else {
			const limit = this.getNodeParameter('limit', index) as number;
			const response = await newRelicApiRequest.call(
				this,
				'GET',
				'/servers.json',
				undefined,
				qs,
			);
			responseData = ((response as IDataObject).servers || []) as IDataObject[];
			responseData = responseData.slice(0, limit);
		}
	} else if (operation === 'get') {
		const serverId = this.getNodeParameter('serverId', index) as string;

		const response = await newRelicApiRequest.call(
			this,
			'GET',
			`/servers/${serverId}.json`,
		);
		responseData = ((response as IDataObject).server as IDataObject) || response;
	} else if (operation === 'update') {
		const serverId = this.getNodeParameter('serverId', index) as string;
		const name = this.getNodeParameter('name', index) as string;

		const body = {
			server: {
				name,
			},
		};

		const response = await newRelicApiRequest.call(
			this,
			'PUT',
			`/servers/${serverId}.json`,
			body,
		);
		responseData = ((response as IDataObject).server as IDataObject) || response;
	} else if (operation === 'delete') {
		const serverId = this.getNodeParameter('serverId', index) as string;

		await newRelicApiRequest.call(
			this,
			'DELETE',
			`/servers/${serverId}.json`,
		);
		responseData = { success: true, serverId };
	} else if (operation === 'getMetricNames') {
		const serverId = this.getNodeParameter('serverId', index) as string;
		const nameFilter = this.getNodeParameter('nameFilter', index, '') as string;

		const qs: IDataObject = {};
		if (nameFilter) {
			qs.name = nameFilter;
		}

		const response = await newRelicApiRequest.call(
			this,
			'GET',
			`/servers/${serverId}/metrics.json`,
			undefined,
			qs,
		);
		responseData = ((response as IDataObject).metrics || []) as IDataObject[];
	} else if (operation === 'getMetricData') {
		const serverId = this.getNodeParameter('serverId', index) as string;
		const metricNames = this.getNodeParameter('metricNames', index) as string;
		const metricValues = this.getNodeParameter('metricValues', index, '') as string;
		const timeRange = this.getNodeParameter('timeRange', index, {}) as IDataObject;

		const qs: IDataObject = {};

		// Add metric names (required)
		const names = metricNames.split(',').map((n) => n.trim()).filter(Boolean);
		names.forEach((name, idx) => {
			qs[`names[${idx}]`] = name;
		});

		// Add metric values if specified
		if (metricValues) {
			const values = metricValues.split(',').map((v) => v.trim()).filter(Boolean);
			values.forEach((value, idx) => {
				qs[`values[${idx}]`] = value;
			});
		}

		// Add time range if specified
		if (timeRange.from) {
			qs.from = timeRange.from;
		}
		if (timeRange.to) {
			qs.to = timeRange.to;
		}
		if (timeRange.period !== undefined) {
			qs.period = timeRange.period;
		}
		if (timeRange.summarize !== undefined) {
			qs.summarize = timeRange.summarize;
		}

		const response = await newRelicApiRequest.call(
			this,
			'GET',
			`/servers/${serverId}/metrics/data.json`,
			undefined,
			qs,
		);
		responseData = ((response as IDataObject).metric_data as IDataObject) || response;
	} else {
		throw new Error(`Operation "${operation}" is not supported`);
	}

	return responseData;
}
