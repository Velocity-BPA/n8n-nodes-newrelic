/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { newRelicApiRequest, newRelicApiRequestAllItems } from '../../transport';
import { buildAlertTerms, buildNrqlConfig } from '../../utils';

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['nrqlCondition'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a NRQL alert condition',
				action: 'Create a NRQL condition',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a NRQL condition',
				action: 'Delete a NRQL condition',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a single NRQL condition',
				action: 'Get a NRQL condition',
			},
			{
				name: 'Get All',
				value: 'getAll',
				description: 'Get all NRQL conditions for a policy',
				action: 'Get all NRQL conditions',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a NRQL condition',
				action: 'Update a NRQL condition',
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
				resource: ['nrqlCondition'],
				operation: ['create', 'getAll'],
			},
		},
		default: '',
		description: 'The ID of the alert policy',
	},
	// Condition ID
	{
		displayName: 'Condition ID',
		name: 'conditionId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['nrqlCondition'],
				operation: ['get', 'update', 'delete'],
			},
		},
		default: '',
		description: 'The ID of the NRQL condition',
	},
	// Create fields
	{
		displayName: 'Condition Name',
		name: 'name',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['nrqlCondition'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Name of the NRQL condition',
	},
	{
		displayName: 'NRQL Query',
		name: 'nrqlQuery',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['nrqlCondition'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'The NRQL query for the condition',
		placeholder: 'SELECT count(*) FROM Transaction WHERE appName = \'MyApp\'',
	},
	{
		displayName: 'Value Function',
		name: 'valueFunction',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['nrqlCondition'],
				operation: ['create'],
			},
		},
		options: [
			{
				name: 'Single Value',
				value: 'single_value',
				description: 'Evaluate each data point individually',
			},
			{
				name: 'Sum',
				value: 'sum',
				description: 'Sum all data points in the evaluation window',
			},
		],
		default: 'single_value',
		description: 'How to evaluate the query results',
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
				resource: ['nrqlCondition'],
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
							{ name: '1', value: '1' },
							{ name: '2', value: '2' },
							{ name: '3', value: '3' },
							{ name: '4', value: '4' },
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
		description: 'Threshold terms for the NRQL condition',
	},
	// Additional options
	{
		displayName: 'Additional Options',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: 'Add Option',
		displayOptions: {
			show: {
				resource: ['nrqlCondition'],
				operation: ['create'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Enabled',
				name: 'enabled',
				type: 'boolean',
				default: true,
				description: 'Whether the condition is enabled',
			},
			{
				displayName: 'Expected Groups',
				name: 'expectedGroups',
				type: 'number',
				default: 0,
				description: 'Expected number of groups for faceted queries',
			},
			{
				displayName: 'Ignore Overlap',
				name: 'ignoreOverlap',
				type: 'boolean',
				default: false,
				description: 'Whether to ignore overlapping groups',
			},
			{
				displayName: 'Runbook URL',
				name: 'runbookUrl',
				type: 'string',
				default: '',
				description: 'URL to runbook for this condition',
			},
			{
				displayName: 'Since Value',
				name: 'sinceValue',
				type: 'options',
				options: [
					{ name: '1 Minute', value: '1' },
					{ name: '2 Minutes', value: '2' },
					{ name: '3 Minutes', value: '3' },
					{ name: '4 Minutes', value: '4' },
					{ name: '5 Minutes', value: '5' },
				],
				default: '3',
				description: 'SINCE clause value in minutes',
			},
			{
				displayName: 'Violation Time Limit (Seconds)',
				name: 'violationTimeLimitSeconds',
				type: 'number',
				default: 86400,
				description: 'Time limit for violations in seconds (default 24 hours)',
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
				resource: ['nrqlCondition'],
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
				resource: ['nrqlCondition'],
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
				resource: ['nrqlCondition'],
				operation: ['update'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Enabled',
				name: 'enabled',
				type: 'boolean',
				default: true,
				description: 'Whether the condition is enabled',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'New name for the condition',
			},
			{
				displayName: 'NRQL Query',
				name: 'nrqlQuery',
				type: 'string',
				default: '',
				description: 'Updated NRQL query',
			},
			{
				displayName: 'Runbook URL',
				name: 'runbookUrl',
				type: 'string',
				default: '',
				description: 'URL to runbook for this condition',
			},
			{
				displayName: 'Value Function',
				name: 'valueFunction',
				type: 'options',
				options: [
					{ name: 'Single Value', value: 'single_value' },
					{ name: 'Sum', value: 'sum' },
				],
				default: 'single_value',
				description: 'How to evaluate the query results',
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
			const nrqlQuery = this.getNodeParameter('nrqlQuery', index) as string;
			const valueFunction = this.getNodeParameter('valueFunction', index) as string;
			const terms = this.getNodeParameter('terms', index) as IDataObject;
			const additionalOptions = this.getNodeParameter('additionalOptions', index, {}) as IDataObject;

			const termsList = (terms.term as IDataObject[]) || [];

			const nrqlConfig = buildNrqlConfig({
				query: nrqlQuery,
				sinceValue: additionalOptions.sinceValue,
			});

			const body = {
				nrql_condition: {
					type: 'static',
					name,
					enabled: additionalOptions.enabled !== false,
					nrql: nrqlConfig,
					terms: buildAlertTerms(termsList),
					value_function: valueFunction,
					violation_time_limit_seconds: additionalOptions.violationTimeLimitSeconds || 86400,
					...(additionalOptions.runbookUrl && { runbook_url: additionalOptions.runbookUrl }),
					...(additionalOptions.expectedGroups && { expected_groups: additionalOptions.expectedGroups }),
					...(additionalOptions.ignoreOverlap !== undefined && { ignore_overlap: additionalOptions.ignoreOverlap }),
				},
			};

			const response = await newRelicApiRequest.call(
				this,
				'POST',
				`/alerts_nrql_conditions/policies/${policyId}.json`,
				body,
			);
			return response.nrql_condition as IDataObject;
		}

		case 'getAll': {
			const policyId = this.getNodeParameter('policyId', index) as string;
			const returnAll = this.getNodeParameter('returnAll', index) as boolean;

			if (returnAll) {
				return await newRelicApiRequestAllItems.call(
					this,
					'nrql_conditions',
					'GET',
					'/alerts_nrql_conditions.json',
					{},
					{ policy_id: policyId },
				);
			} else {
				const limit = this.getNodeParameter('limit', index) as number;
				const response = await newRelicApiRequest.call(
					this,
					'GET',
					'/alerts_nrql_conditions.json',
					{},
					{ policy_id: policyId },
				);
				const conditions = response.nrql_conditions as IDataObject[];
				return conditions.slice(0, limit);
			}
		}

		case 'get': {
			const conditionId = this.getNodeParameter('conditionId', index) as string;
			const response = await newRelicApiRequest.call(
				this,
				'GET',
				'/alerts_nrql_conditions.json',
			);
			const conditions = response.nrql_conditions as IDataObject[];
			const condition = conditions.find((c) => String(c.id) === conditionId);
			if (!condition) {
				throw new Error(`NRQL Condition with ID ${conditionId} not found`);
			}
			return condition;
		}

		case 'update': {
			const conditionId = this.getNodeParameter('conditionId', index) as string;
			const updateFields = this.getNodeParameter('updateFields', index, {}) as IDataObject;

			// Get existing condition
			const existingResponse = await newRelicApiRequest.call(
				this,
				'GET',
				'/alerts_nrql_conditions.json',
			);
			const conditions = existingResponse.nrql_conditions as IDataObject[];
			const existingCondition = conditions.find((c) => String(c.id) === conditionId);

			if (!existingCondition) {
				throw new Error(`NRQL Condition with ID ${conditionId} not found`);
			}

			const body: IDataObject = {
				nrql_condition: {
					...existingCondition,
				},
			};

			const conditionData = body.nrql_condition as IDataObject;

			if (updateFields.name) {
				conditionData.name = updateFields.name;
			}
			if (updateFields.enabled !== undefined) {
				conditionData.enabled = updateFields.enabled;
			}
			if (updateFields.nrqlQuery) {
				conditionData.nrql = buildNrqlConfig({ query: updateFields.nrqlQuery });
			}
			if (updateFields.valueFunction) {
				conditionData.value_function = updateFields.valueFunction;
			}
			if (updateFields.runbookUrl) {
				conditionData.runbook_url = updateFields.runbookUrl;
			}

			const response = await newRelicApiRequest.call(
				this,
				'PUT',
				`/alerts_nrql_conditions/${conditionId}.json`,
				body,
			);
			return response.nrql_condition as IDataObject;
		}

		case 'delete': {
			const conditionId = this.getNodeParameter('conditionId', index) as string;
			await newRelicApiRequest.call(
				this,
				'DELETE',
				`/alerts_nrql_conditions/${conditionId}.json`,
			);
			return { success: true, conditionId };
		}

		default:
			throw new Error(`Operation ${operation} is not supported`);
	}
}
