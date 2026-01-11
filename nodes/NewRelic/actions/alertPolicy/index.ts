/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject, IExecuteFunctions, INodeProperties } from 'n8n-workflow';
import { newRelicApiRequest, newRelicApiRequestAllItems } from '../../transport';

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['alertPolicy'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new alert policy',
				action: 'Create an alert policy',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete an alert policy',
				action: 'Delete an alert policy',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a single alert policy',
				action: 'Get an alert policy',
			},
			{
				name: 'Get All',
				value: 'getAll',
				description: 'Get all alert policies',
				action: 'Get all alert policies',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update an alert policy',
				action: 'Update an alert policy',
			},
		],
		default: 'getAll',
	},
	// Policy ID for single operations
	{
		displayName: 'Policy ID',
		name: 'policyId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['alertPolicy'],
				operation: ['get', 'update', 'delete'],
			},
		},
		default: '',
		description: 'The ID of the alert policy',
	},
	// Create fields
	{
		displayName: 'Policy Name',
		name: 'name',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['alertPolicy'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Name of the alert policy',
	},
	{
		displayName: 'Incident Preference',
		name: 'incidentPreference',
		type: 'options',
		required: true,
		displayOptions: {
			show: {
				resource: ['alertPolicy'],
				operation: ['create'],
			},
		},
		options: [
			{
				name: 'Per Condition',
				value: 'PER_CONDITION',
				description: 'Create an incident for each condition that violates its threshold',
			},
			{
				name: 'Per Condition and Target',
				value: 'PER_CONDITION_AND_TARGET',
				description: 'Create an incident for each condition and target combination',
			},
			{
				name: 'Per Policy',
				value: 'PER_POLICY',
				description: 'Create one incident for all conditions in the policy',
			},
		],
		default: 'PER_POLICY',
		description: 'How incidents should be created for this policy',
	},
	// Return All option for getAll
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['alertPolicy'],
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
				resource: ['alertPolicy'],
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
	// Filters for getAll
	{
		displayName: 'Filters',
		name: 'filters',
		type: 'collection',
		placeholder: 'Add Filter',
		displayOptions: {
			show: {
				resource: ['alertPolicy'],
				operation: ['getAll'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'Filter policies by name (exact match)',
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
				resource: ['alertPolicy'],
				operation: ['update'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Incident Preference',
				name: 'incidentPreference',
				type: 'options',
				options: [
					{
						name: 'Per Condition',
						value: 'PER_CONDITION',
						description: 'Create an incident for each condition that violates its threshold',
					},
					{
						name: 'Per Condition and Target',
						value: 'PER_CONDITION_AND_TARGET',
						description: 'Create an incident for each condition and target combination',
					},
					{
						name: 'Per Policy',
						value: 'PER_POLICY',
						description: 'Create one incident for all conditions in the policy',
					},
				],
				default: 'PER_POLICY',
				description: 'How incidents should be created for this policy',
			},
			{
				displayName: 'Name',
				name: 'name',
				type: 'string',
				default: '',
				description: 'New name for the alert policy',
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
			const incidentPreference = this.getNodeParameter('incidentPreference', index) as string;

			const body = {
				policy: {
					name,
					incident_preference: incidentPreference,
				},
			};

			const response = await newRelicApiRequest.call(
				this,
				'POST',
				'/alerts_policies.json',
				body,
			);
			return response.policy as IDataObject;
		}

		case 'getAll': {
			const returnAll = this.getNodeParameter('returnAll', index) as boolean;
			const filters = this.getNodeParameter('filters', index, {}) as IDataObject;
			const query: IDataObject = {};

			if (filters.name) {
				query['filter[name]'] = filters.name;
			}

			if (returnAll) {
				return await newRelicApiRequestAllItems.call(
					this,
					'policies',
					'GET',
					'/alerts_policies.json',
					{},
					query,
				);
			} else {
				const limit = this.getNodeParameter('limit', index) as number;
				const response = await newRelicApiRequest.call(
					this,
					'GET',
					'/alerts_policies.json',
					{},
					query,
				);
				const policies = response.policies as IDataObject[];
				return policies.slice(0, limit);
			}
		}

		case 'get': {
			const policyId = this.getNodeParameter('policyId', index) as string;
			const response = await newRelicApiRequest.call(
				this,
				'GET',
				'/alerts_policies.json',
				{},
				{ 'filter[id]': policyId },
			);
			const policies = response.policies as IDataObject[];
			if (policies.length === 0) {
				throw new Error(`Policy with ID ${policyId} not found`);
			}
			return policies[0];
		}

		case 'update': {
			const policyId = this.getNodeParameter('policyId', index) as string;
			const updateFields = this.getNodeParameter('updateFields', index, {}) as IDataObject;

			const body: IDataObject = {
				policy: {
					id: parseInt(policyId, 10),
				} as IDataObject,
			};

			const policy = body.policy as IDataObject;

			if (updateFields.name) {
				policy.name = updateFields.name;
			}
			if (updateFields.incidentPreference) {
				policy.incident_preference = updateFields.incidentPreference;
			}

			const response = await newRelicApiRequest.call(
				this,
				'PUT',
				`/alerts_policies/${policyId}.json`,
				body,
			);
			return response.policy as IDataObject;
		}

		case 'delete': {
			const policyId = this.getNodeParameter('policyId', index) as string;
			await newRelicApiRequest.call(
				this,
				'DELETE',
				`/alerts_policies/${policyId}.json`,
			);
			return { success: true, policyId };
		}

		default:
			throw new Error(`Operation ${operation} is not supported`);
	}
}
