/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { newRelicApiRequest, newRelicApiRequestAllItems } from '../../transport';
import { buildFilterQuery, buildMetricQuery } from '../../utils';

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['application'],
			},
		},
		options: [
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete an application',
				action: 'Delete an application',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a single application',
				action: 'Get an application',
			},
			{
				name: 'Get All',
				value: 'getAll',
				description: 'Get all applications',
				action: 'Get all applications',
			},
			{
				name: 'Get Hosts',
				value: 'getHosts',
				description: 'Get hosts associated with an application',
				action: 'Get application hosts',
			},
			{
				name: 'Get Instances',
				value: 'getInstances',
				description: 'Get instances of an application',
				action: 'Get application instances',
			},
			{
				name: 'Get Metric Data',
				value: 'getMetricData',
				description: 'Get metric timeslice data for an application',
				action: 'Get metric data',
			},
			{
				name: 'Get Metric Names',
				value: 'getMetricNames',
				description: 'Get available metric names for an application',
				action: 'Get metric names',
			},
			{
				name: 'Get Summary',
				value: 'getSummary',
				description: 'Get application summary data',
				action: 'Get application summary',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update application settings',
				action: 'Update an application',
			},
		],
		default: 'getAll',
	},
	// Application ID for single operations
	{
		displayName: 'Application ID',
		name: 'applicationId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['application'],
				operation: ['get', 'update', 'delete', 'getMetricNames', 'getMetricData', 'getSummary', 'getHosts', 'getInstances'],
			},
		},
		default: '',
		description: 'The numeric ID of the application',
	},
	// Return All option for getAll
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['application'],
				operation: ['getAll', 'getHosts', 'getInstances', 'getMetricNames'],
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
				resource: ['application'],
				operation: ['getAll', 'getHosts', 'getInstances', 'getMetricNames'],
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
	// Filters for getAll
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		displayOptions: {
			show: {
				resource: ['application'],
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
				description: 'Comma-separated list of application IDs to filter by',
			},
			{
				displayName: 'Language',
				name: 'language',
				type: 'options',
				options: [
					{ name: 'Go', value: 'go' },
					{ name: 'Java', value: 'java' },
					{ name: 'Node.js', value: 'nodejs' },
					{ name: 'PHP', value: 'php' },
					{ name: 'Python', value: 'python' },
					{ name: 'Ruby', value: 'ruby' },
					{ name: '.NET', value: 'dotnet' },
				],
				default: '',
				description: 'Filter applications by agent language',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Filter applications by name (partial match)',
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
				resource: ['application'],
				operation: ['update'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'App Apdex Threshold',
				name: 'appApdexThreshold',
				type: 'number',
				typeOptions: {
					minValue: 0,
					numberPrecision: 2,
				},
				default: 0.5,
				description: 'Application Apdex threshold in seconds',
			},
			{
				displayName: 'Enable Real User Monitoring',
				name: 'enableRealUserMonitoring',
				type: 'boolean',
				default: true,
				description: 'Whether to enable Real User Monitoring (RUM)',
			},
			{
				displayName: 'End User Apdex Threshold',
				name: 'endUserApdexThreshold',
				type: 'number',
				typeOptions: {
					minValue: 0,
					numberPrecision: 2,
				},
				default: 7,
				description: 'End user Apdex threshold in seconds',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'New name for the application',
			},
		],
	},
	// Metric options
	{
		displayName: 'Metric Options',
		name: 'metricOptions',
		type: 'collection',
		placeholder: 'Add Option',
		displayOptions: {
			show: {
				resource: ['application'],
				operation: ['getMetricNames'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Name Filter',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Filter metric names by partial match',
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
				resource: ['application'],
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
				resource: ['application'],
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
				description: 'Start time for metric data (ISO 8601 format)',
			},
			{
				displayName: 'Period',
				name: 'period',
				type: 'number',
				default: 60,
				description: 'Period of timeslices in seconds',
			},
			{
				displayName: 'Raw',
				name: 'raw',
				type: 'boolean',
				default: false,
				description: 'Whether to return raw data instead of rollups',
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
				description: 'End time for metric data (ISO 8601 format)',
			},
			{
				displayName: 'Values',
				name: 'values',
				type: 'string',
				default: '',
				description: 'Comma-separated list of metric values to retrieve (e.g., call_count, average_response_time)',
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
		case 'getAll': {
			const returnAll = this.getNodeParameter('returnAll', index) as boolean;
			const filters = this.getNodeParameter('filters', index, {}) as IDataObject;
			const query = buildFilterQuery(filters);

			if (returnAll) {
				return await newRelicApiRequestAllItems.call(
					this,
					'applications',
					'GET',
					'/applications.json',
					{},
					query,
				);
			} else {
				const limit = this.getNodeParameter('limit', index) as number;
				const response = await newRelicApiRequest.call(
					this,
					'GET',
					'/applications.json',
					{},
					query,
				);
				const applications = response.applications as IDataObject[];
				return applications.slice(0, limit);
			}
		}

		case 'get': {
			const applicationId = this.getNodeParameter('applicationId', index) as string;
			const response = await newRelicApiRequest.call(
				this,
				'GET',
				`/applications/${applicationId}.json`,
			);
			return response.application as IDataObject;
		}

		case 'update': {
			const applicationId = this.getNodeParameter('applicationId', index) as string;
			const updateFields = this.getNodeParameter('updateFields', index, {}) as IDataObject;

			const body: IDataObject = {
				application: {
					settings: {} as IDataObject,
				},
			};

			const appData = body.application as IDataObject;
			const settings = appData.settings as IDataObject;

			if (updateFields.name) {
				appData.name = updateFields.name;
			}
			if (updateFields.appApdexThreshold !== undefined) {
				settings.app_apdex_threshold = updateFields.appApdexThreshold;
			}
			if (updateFields.endUserApdexThreshold !== undefined) {
				settings.end_user_apdex_threshold = updateFields.endUserApdexThreshold;
			}
			if (updateFields.enableRealUserMonitoring !== undefined) {
				settings.enable_real_user_monitoring = updateFields.enableRealUserMonitoring;
			}

			const response = await newRelicApiRequest.call(
				this,
				'PUT',
				`/applications/${applicationId}.json`,
				body,
			);
			return response.application as IDataObject;
		}

		case 'delete': {
			const applicationId = this.getNodeParameter('applicationId', index) as string;
			await newRelicApiRequest.call(
				this,
				'DELETE',
				`/applications/${applicationId}.json`,
			);
			return { success: true, applicationId };
		}

		case 'getMetricNames': {
			const applicationId = this.getNodeParameter('applicationId', index) as string;
			const returnAll = this.getNodeParameter('returnAll', index) as boolean;
			const metricOptions = this.getNodeParameter('metricOptions', index, {}) as IDataObject;
			const query: IDataObject = {};

			if (metricOptions.name) {
				query.name = metricOptions.name;
			}

			if (returnAll) {
				return await newRelicApiRequestAllItems.call(
					this,
					'metrics',
					'GET',
					`/applications/${applicationId}/metrics.json`,
					{},
					query,
				);
			} else {
				const limit = this.getNodeParameter('limit', index) as number;
				const response = await newRelicApiRequest.call(
					this,
					'GET',
					`/applications/${applicationId}/metrics.json`,
					{},
					query,
				);
				const metrics = response.metrics as IDataObject[];
				return metrics.slice(0, limit);
			}
		}

		case 'getMetricData': {
			const applicationId = this.getNodeParameter('applicationId', index) as string;
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
				raw: metricDataOptions.raw,
			});

			const response = await newRelicApiRequest.call(
				this,
				'GET',
				`/applications/${applicationId}/metrics/data.json`,
				{},
				query,
			);
			return response.metric_data as IDataObject;
		}

		case 'getSummary': {
			const applicationId = this.getNodeParameter('applicationId', index) as string;
			const response = await newRelicApiRequest.call(
				this,
				'GET',
				`/applications/${applicationId}.json`,
			);
			const application = response.application as IDataObject;
			return {
				id: application.id,
				name: application.name,
				health_status: application.health_status,
				reporting: application.reporting,
				application_summary: application.application_summary,
				end_user_summary: application.end_user_summary,
			};
		}

		case 'getHosts': {
			const applicationId = this.getNodeParameter('applicationId', index) as string;
			const returnAll = this.getNodeParameter('returnAll', index) as boolean;

			if (returnAll) {
				return await newRelicApiRequestAllItems.call(
					this,
					'application_hosts',
					'GET',
					`/applications/${applicationId}/hosts.json`,
				);
			} else {
				const limit = this.getNodeParameter('limit', index) as number;
				const response = await newRelicApiRequest.call(
					this,
					'GET',
					`/applications/${applicationId}/hosts.json`,
				);
				const hosts = response.application_hosts as IDataObject[];
				return hosts.slice(0, limit);
			}
		}

		case 'getInstances': {
			const applicationId = this.getNodeParameter('applicationId', index) as string;
			const returnAll = this.getNodeParameter('returnAll', index) as boolean;

			if (returnAll) {
				return await newRelicApiRequestAllItems.call(
					this,
					'application_instances',
					'GET',
					`/applications/${applicationId}/instances.json`,
				);
			} else {
				const limit = this.getNodeParameter('limit', index) as number;
				const response = await newRelicApiRequest.call(
					this,
					'GET',
					`/applications/${applicationId}/instances.json`,
				);
				const instances = response.application_instances as IDataObject[];
				return instances.slice(0, limit);
			}
		}

		default:
			throw new Error(`Operation ${operation} is not supported`);
	}
}
