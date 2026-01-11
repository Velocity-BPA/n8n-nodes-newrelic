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
				resource: ['user'],
			},
		},
		options: [
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a user',
				action: 'Delete a user',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a single user',
				action: 'Get a user',
			},
			{
				name: 'Get All',
				value: 'getAll',
				description: 'Get all users',
				action: 'Get all users',
			},
			{
				name: 'Reset Password',
				value: 'resetPassword',
				description: 'Trigger password reset for a user',
				action: 'Reset user password',
			},
		],
		default: 'getAll',
	},
	// User ID
	{
		displayName: 'User ID',
		name: 'userId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['user'],
				operation: ['get', 'delete', 'resetPassword'],
			},
		},
		default: '',
		description: 'The ID of the user',
	},
	// Return All
	{
		displayName: 'Return All',
		name: 'returnAll',
		type: 'boolean',
		displayOptions: {
			show: {
				resource: ['user'],
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
				resource: ['user'],
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
				resource: ['user'],
				operation: ['getAll'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Email',
				name: 'email',
				type: 'string',
				placeholder: 'name@email.com',
				default: '',
				description: 'Filter by email address',
			},
			{
				displayName: 'IDs',
				name: 'ids',
				type: 'string',
				default: '',
				description: 'Comma-separated list of user IDs',
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
			const query: IDataObject = {};

			if (filters.email) {
				query['filter[email]'] = filters.email;
			}
			if (filters.ids) {
				query['filter[ids]'] = filters.ids;
			}

			if (returnAll) {
				return await newRelicApiRequestAllItems.call(
					this,
					'users',
					'GET',
					'/users.json',
					{},
					query,
				);
			} else {
				const limit = this.getNodeParameter('limit', index) as number;
				const response = await newRelicApiRequest.call(
					this,
					'GET',
					'/users.json',
					{},
					query,
				);
				const users = response.users as IDataObject[];
				return users.slice(0, limit);
			}
		}

		case 'get': {
			const userId = this.getNodeParameter('userId', index) as string;
			const response = await newRelicApiRequest.call(
				this,
				'GET',
				`/users/${userId}.json`,
			);
			return response.user as IDataObject;
		}

		case 'resetPassword': {
			const userId = this.getNodeParameter('userId', index) as string;
			await newRelicApiRequest.call(
				this,
				'POST',
				`/users/${userId}/reset_password.json`,
			);
			return { success: true, userId, message: 'Password reset email sent' };
		}

		case 'delete': {
			const userId = this.getNodeParameter('userId', index) as string;
			await newRelicApiRequest.call(
				this,
				'DELETE',
				`/users/${userId}.json`,
			);
			return { success: true, userId };
		}

		default:
			throw new Error(`Operation ${operation} is not supported`);
	}
}
