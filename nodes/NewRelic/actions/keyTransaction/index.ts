/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { newRelicApiRequest, newRelicApiRequestAllItems } from '../../transport';
import { buildMetricQuery } from '../../utils';

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['keyTransaction'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a key transaction',
				action: 'Create a key transaction',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a key transaction',
				action: 'Delete a key transaction',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a single key transaction',
				action: 'Get a key transaction',
			},
			{
				name: 'Get All',
				value: 'getAll',
				description: 'Get all key transactions',
				action: 'Get all key transactions',
			},
			{
				name: 'Get Metric Data',
				value: 'getMetricData',
				description: 'Get metric data for a key transaction',
				action: 'Get key transaction metric data',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a key transaction',
				action: 'Update a key transaction',
			},
		],
		default: 'getAll',
	},
	// Key Transaction ID
	{
		displayName: 'Key Transaction ID',
		name: 'keyTransactionId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['keyTransaction'],
				operation: ['get', 'update', 'delete', 'getMetricData'],
			},
		},
		default: '',
		description: 'The ID of the key transaction',
	},
	// Create fields
	{
		displayName: 'Application ID',
		name: 'applicationId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['keyTransaction'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'The ID of the application',
	},
	{
		displayName: 'Transaction Name',
		name: 'transactionName',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['keyTransaction'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Full transaction name path',
	},
	{
		displayName: 'Display Name',
		name: 'name',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['keyTransaction'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Display name for the key transaction',
	},
	// Create additional options
	{
		displayName: 'Additional Options',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: 'Add Option',
		displayOptions: {
			show: {
				resource: ['keyTransaction'],
				operation: ['create'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Apdex Threshold',
				name: 'apdexThreshold',
				type: 'number',
				typeOptions: {
					minValue: 0,
					numberPrecision: 2,
				},
				default: 0.5,
				description: 'Apdex threshold in seconds',
			},
		],
	},
	// Return All
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['keyTransaction'],
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
				resource: ['keyTransaction'],
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
	// Filters
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		displayOptions: {
			show: {
				resource: ['keyTransaction'],
				operation: ['getAll'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'IDs',
				name: 'ids',
				type: 'string',
				default: '',
				description: 'Comma-separated list of key transaction IDs',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Filter by name (partial match)',
			},
		],
	},
	// Update fields
	{
		displayName: 'Update Fields',
		name: 'updateFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				resource: ['keyTransaction'],
				operation: ['update'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Apdex Threshold',
				name: 'apdexThreshold',
				type: 'number',
				typeOptions: {
					minValue: 0,
					numberPrecision: 2,
				},
				default: 0.5,
				description: 'Apdex threshold in seconds',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'New display name',
			},
		],
	},
	// Metric data options
	{
		displayName: 'Metric Names',
		name: 'metricNames',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['keyTransaction'],
				operation: ['getMetricData'],
			},
		},
		default: '',
		description: 'Comma-separated list of metric names to retrieve',
	},
	{
		displayName: 'Metric Data Options',
		name: 'metricDataOptions',
		type: 'collection',
		placeholder: 'Add Option',
		displayOptions: {
			show: {
				resource: ['keyTransaction'],
				operation: ['getMetricData'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'From',
				name: 'from',
				type: 'dateTime',
				default: '',
				description: 'Start time for metric data',
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
				default: false,
				description: 'Whether to return summarized data',
			},
			{
				displayName: 'To',
				name: 'to',
				type: 'dateTime',
				default: '',
				description: 'End time for metric data',
			},
			{
				displayName: 'Values',
				name: 'values',
				type: 'string',
				default: '',
				description: 'Comma-separated list of metric values to retrieve',
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
			const applicationId = this.getNodeParameter('applicationId', index) as string;
			const transactionName = this.getNodeParameter('transactionName', index) as string;
			const name = this.getNodeParameter('name', index) as string;
			const additionalOptions = this.getNodeParameter('additionalOptions', index, {}) as IDataObject;

			const body = {
				key_transaction: {
					application_id: parseInt(applicationId, 10),
					transaction_name: transactionName,
					name,
					...(additionalOptions.apdexThreshold && {
						application_summary: {
							apdex_target: additionalOptions.apdexThreshold,
						},
					}),
				},
			};

			const response = await newRelicApiRequest.call(
				this,
				'POST',
				'/key_transactions.json',
				body,
			);
			return response.key_transaction as IDataObject;
		}

		case 'getAll': {
			const returnAll = this.getNodeParameter('returnAll', index) as boolean;
			const filters = this.getNodeParameter('filters', index, {}) as IDataObject;
			const query: IDataObject = {};

			if (filters.name) {
				query['filter[name]'] = filters.name;
			}
			if (filters.ids) {
				query['filter[ids]'] = filters.ids;
			}

			if (returnAll) {
				return await newRelicApiRequestAllItems.call(
					this,
					'key_transactions',
					'GET',
					'/key_transactions.json',
					{},
					query,
				);
			} else {
				const limit = this.getNodeParameter('limit', index) as number;
				const response = await newRelicApiRequest.call(
					this,
					'GET',
					'/key_transactions.json',
					{},
					query,
				);
				const keyTransactions = response.key_transactions as IDataObject[];
				return keyTransactions.slice(0, limit);
			}
		}

		case 'get': {
			const keyTransactionId = this.getNodeParameter('keyTransactionId', index) as string;
			const response = await newRelicApiRequest.call(
				this,
				'GET',
				`/key_transactions/${keyTransactionId}.json`,
			);
			return response.key_transaction as IDataObject;
		}

		case 'update': {
			const keyTransactionId = this.getNodeParameter('keyTransactionId', index) as string;
			const updateFields = this.getNodeParameter('updateFields', index, {}) as IDataObject;

			const body: IDataObject = {
				key_transaction: {} as IDataObject,
			};

			const kt = body.key_transaction as IDataObject;

			if (updateFields.name) {
				kt.name = updateFields.name;
			}
			if (updateFields.apdexThreshold !== undefined) {
				kt.application_summary = {
					apdex_target: updateFields.apdexThreshold,
				};
			}

			const response = await newRelicApiRequest.call(
				this,
				'PUT',
				`/key_transactions/${keyTransactionId}.json`,
				body,
			);
			return response.key_transaction as IDataObject;
		}

		case 'delete': {
			const keyTransactionId = this.getNodeParameter('keyTransactionId', index) as string;
			await newRelicApiRequest.call(
				this,
				'DELETE',
				`/key_transactions/${keyTransactionId}.json`,
			);
			return { success: true, keyTransactionId };
		}

		case 'getMetricData': {
			const keyTransactionId = this.getNodeParameter('keyTransactionId', index) as string;
			const metricNames = this.getNodeParameter('metricNames', index) as string;
			const metricDataOptions = this.getNodeParameter('metricDataOptions', index, {}) as IDataObject;

			const names = metricNames.split(',').map((n) => n.trim());
			const values = metricDataOptions.values
				? (metricDataOptions.values as string).split(',').map((v) => v.trim())
				: undefined;

			const query = buildMetricQuery({
				names,
				values,
				from: metricDataOptions.from,
				to: metricDataOptions.to,
				period: metricDataOptions.period,
				summarize: metricDataOptions.summarize,
			});

			const response = await newRelicApiRequest.call(
				this,
				'GET',
				`/key_transactions/${keyTransactionId}/metrics/data.json`,
				{},
				query,
			);
			return response.metric_data as IDataObject;
		}

		default:
			throw new Error(`Operation ${operation} is not supported`);
	}
}
