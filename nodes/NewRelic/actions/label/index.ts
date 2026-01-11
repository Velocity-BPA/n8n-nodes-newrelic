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
import { parseLabelKey } from '../../utils';

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: {
			show: {
				resource: ['label'],
			},
		},
		options: [
			{
				name: 'Add to Application',
				value: 'addToApplication',
				description: 'Add label to an application',
				action: 'Add label to application',
			},
			{
				name: 'Create',
				value: 'create',
				description: 'Create a label',
				action: 'Create a label',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a label',
				action: 'Delete a label',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a label by key',
				action: 'Get a label',
			},
			{
				name: 'Get Applications',
				value: 'getApplications',
				description: 'Get applications with a label',
				action: 'Get applications with label',
			},
			{
				name: 'Get Many',
				value: 'getAll',
				description: 'Get many labels',
				action: 'Get many labels',
			},
			{
				name: 'Remove from Application',
				value: 'removeFromApplication',
				description: 'Remove label from an application',
				action: 'Remove label from application',
			},
		],
		default: 'getAll',
	},
	// Label Key - for get, delete, getApplications
	{
		displayName: 'Label Key',
		name: 'labelKey',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['label'],
				operation: ['get', 'delete', 'getApplications', 'addToApplication', 'removeFromApplication'],
			},
		},
		placeholder: 'Category:Name',
		description: 'Label key in Category:Name format',
	},
	// Create fields
	{
		displayName: 'Category',
		name: 'category',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['label'],
				operation: ['create'],
			},
		},
		placeholder: 'Environment',
		description: 'Category of the label',
	},
	{
		displayName: 'Name',
		name: 'name',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['label'],
				operation: ['create'],
			},
		},
		placeholder: 'Production',
		description: 'Name of the label',
	},
	// Application ID for add/remove
	{
		displayName: 'Application ID',
		name: 'applicationId',
		type: 'string',
		required: true,
		default: '',
		displayOptions: {
			show: {
				resource: ['label'],
				operation: ['addToApplication', 'removeFromApplication'],
			},
		},
		description: 'ID of the application to add/remove the label',
	},
	// GetAll options
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		default: false,
		displayOptions: {
			show: {
				resource: ['label'],
				operation: ['getAll', 'getApplications'],
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
				resource: ['label'],
				operation: ['getAll', 'getApplications'],
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

	if (operation === 'create') {
		const category = this.getNodeParameter('category', index) as string;
		const name = this.getNodeParameter('name', index) as string;

		const body = {
			label: {
				category,
				name,
			},
		};

		responseData = await newRelicApiRequest.call(
			this,
			'PUT',
			'/labels.json',
			body,
		);
		responseData = ((responseData as IDataObject).label as IDataObject) || responseData;
	} else if (operation === 'getAll') {
		const returnAll = this.getNodeParameter('returnAll', index) as boolean;

		if (returnAll) {
			responseData = await newRelicApiRequestAllItems.call(
				this,
				'labels',
				'GET',
				'/labels.json',
			);
		} else {
			const limit = this.getNodeParameter('limit', index) as number;
			const response = await newRelicApiRequest.call(
				this,
				'GET',
				'/labels.json',
			);
			responseData = ((response as IDataObject).labels || []) as IDataObject[];
			responseData = responseData.slice(0, limit);
		}
	} else if (operation === 'get') {
		const labelKey = this.getNodeParameter('labelKey', index) as string;

		// Labels API doesn't have direct get by key, so we need to list and filter
		const labels = await newRelicApiRequestAllItems.call(
			this,
			'labels',
			'GET',
			'/labels.json',
		);

		const label = labels.find((l: IDataObject) => l.key === labelKey);
		if (!label) {
			throw new Error(`Label with key "${labelKey}" not found`);
		}
		responseData = label;
	} else if (operation === 'delete') {
		const labelKey = this.getNodeParameter('labelKey', index) as string;
		const encodedKey = encodeURIComponent(labelKey);

		await newRelicApiRequest.call(
			this,
			'DELETE',
			`/labels/${encodedKey}.json`,
		);
		responseData = { success: true, labelKey };
	} else if (operation === 'getApplications') {
		const labelKey = this.getNodeParameter('labelKey', index) as string;
		const returnAll = this.getNodeParameter('returnAll', index) as boolean;

		// Labels are retrieved with their applications
		const labels = await newRelicApiRequestAllItems.call(
			this,
			'labels',
			'GET',
			'/labels.json',
		);

		const label = labels.find((l: IDataObject) => l.key === labelKey) as IDataObject | undefined;
		if (!label) {
			throw new Error(`Label with key "${labelKey}" not found`);
		}

		// Get the application IDs from the label
		const applicationIds = (label.links as IDataObject)?.applications || [];
		
		if (Array.isArray(applicationIds) && applicationIds.length > 0) {
			// Fetch application details
			const applications: IDataObject[] = [];
			for (const appId of applicationIds) {
				try {
					const app = await newRelicApiRequest.call(
						this,
						'GET',
						`/applications/${appId}.json`,
					);
					applications.push((app as IDataObject).application as IDataObject);
				} catch {
					// Application may have been deleted
				}
			}
			responseData = returnAll ? applications : applications.slice(0, this.getNodeParameter('limit', index, 50) as number);
		} else {
			responseData = [];
		}
	} else if (operation === 'addToApplication') {
		const labelKey = this.getNodeParameter('labelKey', index) as string;
		const applicationId = this.getNodeParameter('applicationId', index) as string;
		const { category, name } = parseLabelKey(labelKey);

		const body = {
			label: {
				category,
				name,
				links: {
					applications: [parseInt(applicationId, 10)],
				},
			},
		};

		responseData = await newRelicApiRequest.call(
			this,
			'PUT',
			'/labels.json',
			body,
		);
		responseData = ((responseData as IDataObject).label as IDataObject) || responseData;
	} else if (operation === 'removeFromApplication') {
		const labelKey = this.getNodeParameter('labelKey', index) as string;
		const applicationId = this.getNodeParameter('applicationId', index) as string;

		// Get the current label
		const labels = await newRelicApiRequestAllItems.call(
			this,
			'labels',
			'GET',
			'/labels.json',
		);

		const label = labels.find((l: IDataObject) => l.key === labelKey) as IDataObject | undefined;
		if (!label) {
			throw new Error(`Label with key "${labelKey}" not found`);
		}

		// Get current application IDs and remove the specified one
		const currentApps = ((label.links as IDataObject)?.applications || []) as number[];
		const updatedApps = currentApps.filter((id) => id !== parseInt(applicationId, 10));

		const { category, name } = parseLabelKey(labelKey);

		const body = {
			label: {
				category,
				name,
				links: {
					applications: updatedApps,
				},
			},
		};

		responseData = await newRelicApiRequest.call(
			this,
			'PUT',
			'/labels.json',
			body,
		);
		responseData = ((responseData as IDataObject).label as IDataObject) || responseData;
	} else {
		throw new Error(`Operation "${operation}" is not supported`);
	}

	return responseData;
}
