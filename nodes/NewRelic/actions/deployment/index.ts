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
				resource: ['deployment'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Record a deployment marker',
				action: 'Create a deployment',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a deployment record',
				action: 'Delete a deployment',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a single deployment',
				action: 'Get a deployment',
			},
			{
				name: 'Get All',
				value: 'getAll',
				description: 'Get all deployments for an application',
				action: 'Get all deployments',
			},
		],
		default: 'getAll',
	},
	// Application ID
	{
		displayName: 'Application ID',
		name: 'applicationId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['deployment'],
				operation: ['create', 'getAll', 'get', 'delete'],
			},
		},
		default: '',
		description: 'The ID of the application',
	},
	// Deployment ID
	{
		displayName: 'Deployment ID',
		name: 'deploymentId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['deployment'],
				operation: ['get', 'delete'],
			},
		},
		default: '',
		description: 'The ID of the deployment',
	},
	// Create fields
	{
		displayName: 'Revision',
		name: 'revision',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['deployment'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Deployment revision/version (e.g., v1.2.3, git SHA)',
	},
	{
		displayName: 'Additional Fields',
		name: 'additionalFields',
		type: 'collection',
		placeholder: 'Add Field',
		displayOptions: {
			show: {
				resource: ['deployment'],
				operation: ['create'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Changelog',
				name: 'changelog',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Summary of changes in this deployment',
			},
			{
				displayName: 'Description',
				name: 'description',
				type: 'string',
				typeOptions: {
					rows: 4,
				},
				default: '',
				description: 'Deployment description',
			},
			{
				displayName: 'Timestamp',
				name: 'timestamp',
				type: 'dateTime',
				default: '',
				description: 'Deployment timestamp (defaults to now)',
			},
			{
				displayName: 'User',
				name: 'user',
				type: 'string',
				default: '',
				description: 'User who deployed',
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
				resource: ['deployment'],
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
				resource: ['deployment'],
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
];

export async function execute(
	this: IExecuteFunctions,
	index: number,
): Promise<IDataObject | IDataObject[]> {
	const operation = this.getNodeParameter('operation', index) as string;

	switch (operation) {
		case 'create': {
			const applicationId = this.getNodeParameter('applicationId', index) as string;
			const revision = this.getNodeParameter('revision', index) as string;
			const additionalFields = this.getNodeParameter('additionalFields', index, {}) as IDataObject;

			const body = {
				deployment: {
					revision,
					...(additionalFields.changelog && { changelog: additionalFields.changelog }),
					...(additionalFields.description && { description: additionalFields.description }),
					...(additionalFields.user && { user: additionalFields.user }),
					...(additionalFields.timestamp && { timestamp: additionalFields.timestamp }),
				},
			};

			const response = await newRelicApiRequest.call(
				this,
				'POST',
				`/applications/${applicationId}/deployments.json`,
				body,
			);
			return response.deployment as IDataObject;
		}

		case 'getAll': {
			const applicationId = this.getNodeParameter('applicationId', index) as string;
			const returnAll = this.getNodeParameter('returnAll', index) as boolean;

			if (returnAll) {
				return await newRelicApiRequestAllItems.call(
					this,
					'deployments',
					'GET',
					`/applications/${applicationId}/deployments.json`,
				);
			} else {
				const limit = this.getNodeParameter('limit', index) as number;
				const response = await newRelicApiRequest.call(
					this,
					'GET',
					`/applications/${applicationId}/deployments.json`,
				);
				const deployments = response.deployments as IDataObject[];
				return deployments.slice(0, limit);
			}
		}

		case 'get': {
			const applicationId = this.getNodeParameter('applicationId', index) as string;
			const deploymentId = this.getNodeParameter('deploymentId', index) as string;
			const response = await newRelicApiRequest.call(
				this,
				'GET',
				`/applications/${applicationId}/deployments.json`,
			);
			const deployments = response.deployments as IDataObject[];
			const deployment = deployments.find((d) => String(d.id) === deploymentId);
			if (!deployment) {
				throw new Error(`Deployment with ID ${deploymentId} not found`);
			}
			return deployment;
		}

		case 'delete': {
			const applicationId = this.getNodeParameter('applicationId', index) as string;
			const deploymentId = this.getNodeParameter('deploymentId', index) as string;
			await newRelicApiRequest.call(
				this,
				'DELETE',
				`/applications/${applicationId}/deployments/${deploymentId}.json`,
			);
			return { success: true, deploymentId };
		}

		default:
			throw new Error(`Operation ${operation} is not supported`);
	}
}
