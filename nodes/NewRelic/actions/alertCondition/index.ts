/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { newRelicApiRequest, newRelicApiRequestAllItems } from '../../transport';
import { buildAlertTerms } from '../../utils';

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['alertCondition'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new alert condition',
				action: 'Create an alert condition',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete an alert condition',
				action: 'Delete an alert condition',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a single alert condition',
				action: 'Get an alert condition',
			},
			{
				name: 'Get All',
				value: 'getAll',
				description: 'Get all alert conditions for a policy',
				action: 'Get all alert conditions',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update an alert condition',
				action: 'Update an alert condition',
			},
		],
		default: 'getAll',
	},
	// Policy ID
	{
		displayName: 'Policy ID',
		name: 'policyId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['alertCondition'],
				operation: ['create', 'getAll'],
			},
		},
		default: '',
		description: 'The ID of the alert policy',
	},
	// Condition ID for single operations
	{
		displayName: 'Condition ID',
		name: 'conditionId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['alertCondition'],
				operation: ['get', 'update', 'delete'],
			},
		},
		default: '',
		description: 'The ID of the alert condition',
	},
	// Create fields
	{
		displayName: 'Condition Name',
		name: 'name',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['alertCondition'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Name of the alert condition',
	},
	{
		displayName: 'Type',
		name: 'type',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['alertCondition'],
				operation: ['create'],
			},
		},
		options: [
			{
				name: 'APM Application Metric',
				value: 'apm_app_metric',
				description: 'APM application metric condition',
			},
			{
				name: 'APM Key Transaction Metric',
				value: 'apm_kt_metric',
				description: 'APM key transaction metric condition',
			},
			{
				name: 'Browser Metric',
				value: 'browser_metric',
				description: 'Browser metric condition',
			},
			{
				name: 'Mobile Metric',
				value: 'mobile_metric',
				description: 'Mobile metric condition',
			},
		],
		default: 'apm_app_metric',
		description: 'Type of alert condition',
	},
	{
		displayName: 'Metric',
		name: 'metric',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['alertCondition'],
				operation: ['create'],
			},
		},
		options: [
			{ name: 'Apdex', value: 'apdex' },
			{ name: 'Error Percentage', value: 'error_percentage' },
			{ name: 'Response Time (Background)', value: 'response_time_background' },
			{ name: 'Response Time (Web)', value: 'response_time_web' },
			{ name: 'Throughput (Background)', value: 'throughput_background' },
			{ name: 'Throughput (Web)', value: 'throughput_web' },
			{ name: 'User Defined', value: 'user_defined' },
		],
		default: 'apdex',
		description: 'Metric to alert on',
	},
	{
		displayName: 'Entity IDs',
		name: 'entities',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['alertCondition'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Comma-separated list of entity IDs (application IDs) to monitor',
	},
	{
		displayName: 'Terms',
		name: 'terms',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		required: true,
		displayOptions: {
			show: {
				resource: ['alertCondition'],
				operation: ['create'],
			},
		},
		default: { term: [] },
		options: [
			{
				name: 'term',
				displayName: 'Term',
				values: [
					{
						displayName: 'Duration (Minutes)',
						name: 'duration',
						type: 'options',
						options: [
							{ name: '5', value: '5' },
							{ name: '10', value: '10' },
							{ name: '15', value: '15' },
							{ name: '30', value: '30' },
							{ name: '60', value: '60' },
							{ name: '120', value: '120' },
						],
						default: '5',
						description: 'Duration in minutes for the condition evaluation',
					},
					{
						displayName: 'Operator',
						name: 'operator',
						type: 'options',
						options: [
							{ name: 'Above', value: 'above' },
							{ name: 'Below', value: 'below' },
							{ name: 'Equal', value: 'equal' },
						],
						default: 'above',
						description: 'Comparison operator',
					},
					{
						displayName: 'Priority',
						name: 'priority',
						type: 'options',
						options: [
							{ name: 'Critical', value: 'critical' },
							{ name: 'Warning', value: 'warning' },
						],
						default: 'critical',
						description: 'Alert priority level',
					},
					{
						displayName: 'Threshold',
						name: 'threshold',
						type: 'number',
						default: 0,
						description: 'Threshold value for the condition',
					},
					{
						displayName: 'Time Function',
						name: 'timeFunction',
						type: 'options',
						options: [
							{ name: 'All', value: 'all' },
							{ name: 'Any', value: 'any' },
						],
						default: 'all',
						description: 'Whether all or any data points must violate the threshold',
					},
				],
			},
		],
		description: 'Threshold terms for the condition',
	},
	// Additional create options
	{
		displayName: 'Additional Options',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: 'Add Option',
		displayOptions: {
			show: {
				resource: ['alertCondition'],
				operation: ['create'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Condition Scope',
				name: 'conditionScope',
				type: 'options',
				options: [
					{ name: 'Application', value: 'application' },
					{ name: 'Instance', value: 'instance' },
				],
				default: 'application',
				description: 'Scope of the condition',
			},
			{
				displayName: 'Enabled',
				name: 'enabled',
				type: 'boolean',
				default: true,
				description: 'Whether the condition is enabled',
			},
			{
				displayName: 'Runbook URL',
				name: 'runbookUrl',
				type: 'string',
				default: '',
				description: 'URL to runbook for this condition',
			},
			{
				displayName: 'Violation Close Timer (Hours)',
				name: 'violationCloseTimer',
				type: 'options',
				options: [
					{ name: '1', value: 1 },
					{ name: '2', value: 2 },
					{ name: '4', value: 4 },
					{ name: '8', value: 8 },
					{ name: '12', value: 12 },
					{ name: '24', value: 24 },
				],
				default: 24,
				description: 'Hours after which violations auto-close',
			},
		],
	},
	// Return All option
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['alertCondition'],
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
				resource: ['alertCondition'],
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
				resource: ['alertCondition'],
				operation: ['update'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Condition Scope',
				name: 'conditionScope',
				type: 'options',
				options: [
					{ name: 'Application', value: 'application' },
					{ name: 'Instance', value: 'instance' },
				],
				default: 'application',
				description: 'Scope of the condition',
			},
			{
				displayName: 'Enabled',
				name: 'enabled',
				type: 'boolean',
				default: true,
				description: 'Whether the condition is enabled',
			},
			{
				displayName: 'Metric',
				name: 'metric',
				type: 'options',
				options: [
					{ name: 'Apdex', value: 'apdex' },
					{ name: 'Error Percentage', value: 'error_percentage' },
					{ name: 'Response Time (Background)', value: 'response_time_background' },
					{ name: 'Response Time (Web)', value: 'response_time_web' },
					{ name: 'Throughput (Background)', value: 'throughput_background' },
					{ name: 'Throughput (Web)', value: 'throughput_web' },
					{ name: 'User Defined', value: 'user_defined' },
				],
				default: 'apdex',
				description: 'Metric to alert on',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'New name for the condition',
			},
			{
				displayName: 'Runbook URL',
				name: 'runbookUrl',
				type: 'string',
				default: '',
				description: 'URL to runbook for this condition',
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
			const policyId = this.getNodeParameter('policyId', index) as string;
			const name = this.getNodeParameter('name', index) as string;
			const type = this.getNodeParameter('type', index) as string;
			const metric = this.getNodeParameter('metric', index) as string;
			const entities = this.getNodeParameter('entities', index) as string;
			const terms = this.getNodeParameter('terms', index) as IDataObject;
			const additionalOptions = this.getNodeParameter('additionalOptions', index, {}) as IDataObject;

			const entityIds = entities.split(',').map((id) => parseInt(id.trim(), 10));
			const termsList = (terms.term as IDataObject[]) || [];

			const body = {
				condition: {
					type,
					name,
					enabled: additionalOptions.enabled !== false,
					entities: entityIds,
					metric,
					terms: buildAlertTerms(termsList),
					condition_scope: additionalOptions.conditionScope || 'application',
					runbook_url: additionalOptions.runbookUrl || undefined,
					violation_close_timer: additionalOptions.violationCloseTimer || undefined,
				},
			};

			const response = await newRelicApiRequest.call(
				this,
				'POST',
				`/alerts_conditions/policies/${policyId}.json`,
				body,
			);
			return response.condition as IDataObject;
		}

		case 'getAll': {
			const policyId = this.getNodeParameter('policyId', index) as string;
			const returnAll = this.getNodeParameter('returnAll', index) as boolean;

			if (returnAll) {
				return await newRelicApiRequestAllItems.call(
					this,
					'conditions',
					'GET',
					'/alerts_conditions.json',
					{},
					{ policy_id: policyId },
				);
			} else {
				const limit = this.getNodeParameter('limit', index) as number;
				const response = await newRelicApiRequest.call(
					this,
					'GET',
					'/alerts_conditions.json',
					{},
					{ policy_id: policyId },
				);
				const conditions = response.conditions as IDataObject[];
				return conditions.slice(0, limit);
			}
		}

		case 'get': {
			const conditionId = this.getNodeParameter('conditionId', index) as string;
			// New Relic doesn't have a direct get by ID, so we list and filter
			const response = await newRelicApiRequest.call(
				this,
				'GET',
				'/alerts_conditions.json',
			);
			const conditions = response.conditions as IDataObject[];
			const condition = conditions.find((c) => String(c.id) === conditionId);
			if (!condition) {
				throw new Error(`Condition with ID ${conditionId} not found`);
			}
			return condition;
		}

		case 'update': {
			const conditionId = this.getNodeParameter('conditionId', index) as string;
			const updateFields = this.getNodeParameter('updateFields', index, {}) as IDataObject;

			// First get the existing condition
			const existingResponse = await newRelicApiRequest.call(
				this,
				'GET',
				'/alerts_conditions.json',
			);
			const conditions = existingResponse.conditions as IDataObject[];
			const existingCondition = conditions.find((c) => String(c.id) === conditionId);
			
			if (!existingCondition) {
				throw new Error(`Condition with ID ${conditionId} not found`);
			}

			const body = {
				condition: {
					...existingCondition,
					...(updateFields.name && { name: updateFields.name }),
					...(updateFields.metric && { metric: updateFields.metric }),
					...(updateFields.enabled !== undefined && { enabled: updateFields.enabled }),
					...(updateFields.conditionScope && { condition_scope: updateFields.conditionScope }),
					...(updateFields.runbookUrl && { runbook_url: updateFields.runbookUrl }),
				},
			};

			const response = await newRelicApiRequest.call(
				this,
				'PUT',
				`/alerts_conditions/${conditionId}.json`,
				body,
			);
			return response.condition as IDataObject;
		}

		case 'delete': {
			const conditionId = this.getNodeParameter('conditionId', index) as string;
			await newRelicApiRequest.call(
				this,
				'DELETE',
				`/alerts_conditions/${conditionId}.json`,
			);
			return { success: true, conditionId };
		}

		default:
			throw new Error(`Operation ${operation} is not supported`);
	}
}
