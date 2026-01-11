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
				resource: ['dashboard'],
			},
		},
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new dashboard',
				action: 'Create a dashboard',
			},
			{
				name: 'Delete',
				value: 'delete',
				description: 'Delete a dashboard',
				action: 'Delete a dashboard',
			},
			{
				name: 'Get',
				value: 'get',
				description: 'Get a single dashboard',
				action: 'Get a dashboard',
			},
			{
				name: 'Get All',
				value: 'getAll',
				description: 'Get all dashboards',
				action: 'Get all dashboards',
			},
			{
				name: 'Update',
				value: 'update',
				description: 'Update a dashboard',
				action: 'Update a dashboard',
			},
		],
		default: 'getAll',
	},
	// Dashboard ID
	{
		displayName: 'Dashboard ID',
		name: 'dashboardId',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['dashboard'],
				operation: ['get', 'update', 'delete'],
			},
		},
		default: '',
		description: 'The ID of the dashboard',
	},
	// Create fields
	{
		displayName: 'Title',
		name: 'title',
		type: 'string',
		required: true,
		displayOptions: {
			show: {
				resource: ['dashboard'],
				operation: ['create'],
			},
		},
		default: '',
		description: 'Title of the dashboard',
	},
	{
		displayName: 'Visibility',
		name: 'visibility',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['dashboard'],
				operation: ['create'],
			},
		},
		options: [
			{
				name: 'All',
				value: 'all',
				description: 'Visible to all users in the account',
			},
			{
				name: 'Owner',
				value: 'owner',
				description: 'Visible only to the owner',
			},
		],
		default: 'all',
		description: 'Dashboard visibility setting',
	},
	{
		displayName: 'Editable',
		name: 'editable',
		type: 'options',
		displayOptions: {
			show: {
				resource: ['dashboard'],
				operation: ['create'],
			},
		},
		options: [
			{
				name: 'Editable by All',
				value: 'editable_by_all',
				description: 'All users can edit',
			},
			{
				name: 'Editable by Owner',
				value: 'editable_by_owner',
				description: 'Only owner can edit',
			},
			{
				name: 'Read Only',
				value: 'read_only',
				description: 'No one can edit',
			},
		],
		default: 'editable_by_owner',
		description: 'Dashboard edit permission',
	},
	{
		displayName: 'Widgets',
		name: 'widgets',
		type: 'fixedCollection',
		typeOptions: {
			multipleValues: true,
		},
		displayOptions: {
			show: {
				resource: ['dashboard'],
				operation: ['create'],
			},
		},
		default: { widget: [] },
		options: [
			{
				name: 'widget',
				displayName: 'Widget',
				values: [
					{
						displayName: 'Title',
						name: 'title',
						type: 'string',
						default: '',
						description: 'Widget title',
					},
					{
						displayName: 'Visualization',
						name: 'visualization',
						type: 'options',
						options: [
							{ name: 'Area Chart', value: 'facet_area_chart' },
							{ name: 'Bar Chart', value: 'facet_bar_chart' },
							{ name: 'Billboard', value: 'billboard' },
							{ name: 'Comparison Line Chart', value: 'comparison_line_chart' },
							{ name: 'Event Feed', value: 'event_feed' },
							{ name: 'Event Table', value: 'event_table' },
							{ name: 'Facet Table', value: 'facet_table' },
							{ name: 'Funnel', value: 'funnel' },
							{ name: 'Heatmap', value: 'heatmap' },
							{ name: 'Histogram', value: 'histogram' },
							{ name: 'Line Chart', value: 'line_chart' },
							{ name: 'Markdown', value: 'markdown' },
							{ name: 'Metric Line Chart', value: 'metric_line_chart' },
							{ name: 'Pie Chart', value: 'facet_pie_chart' },
						],
						default: 'line_chart',
						description: 'Widget visualization type',
					},
					{
						displayName: 'NRQL Query',
						name: 'nrql',
						type: 'string',
						default: '',
						description: 'NRQL query for the widget data',
					},
					{
						displayName: 'Account ID',
						name: 'accountId',
						type: 'number',
						default: 0,
						description: 'Account ID for the widget data',
					},
					{
						displayName: 'Width',
						name: 'width',
						type: 'number',
						typeOptions: { minValue: 1, maxValue: 3 },
						default: 1,
						description: 'Widget width (1-3 columns)',
					},
					{
						displayName: 'Height',
						name: 'height',
						type: 'number',
						typeOptions: { minValue: 1, maxValue: 3 },
						default: 1,
						description: 'Widget height (1-3 rows)',
					},
					{
						displayName: 'Row',
						name: 'row',
						type: 'number',
						typeOptions: { minValue: 1 },
						default: 1,
						description: 'Widget row position',
					},
					{
						displayName: 'Column',
						name: 'column',
						type: 'number',
						typeOptions: { minValue: 1, maxValue: 3 },
						default: 1,
						description: 'Widget column position',
					},
					{
						displayName: 'Notes',
						name: 'notes',
						type: 'string',
						default: '',
						description: 'Widget notes/description',
					},
				],
			},
		],
		description: 'Dashboard widgets',
	},
	// Additional create options
	{
		displayName: 'Additional Options',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: 'Add Option',
		displayOptions: {
			show: {
				resource: ['dashboard'],
				operation: ['create'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Icon',
				name: 'icon',
				type: 'options',
				options: [
					{ name: 'Adjust', value: 'adjust' },
					{ name: 'Archive', value: 'archive' },
					{ name: 'Bar Chart', value: 'bar-chart' },
					{ name: 'Bell', value: 'bell' },
					{ name: 'Bolt', value: 'bolt' },
					{ name: 'Bug', value: 'bug' },
					{ name: 'Bullhorn', value: 'bullhorn' },
					{ name: 'Bullseye', value: 'bullseye' },
					{ name: 'Clock', value: 'clock-o' },
					{ name: 'Cloud', value: 'cloud' },
					{ name: 'Cog', value: 'cog' },
					{ name: 'Comments', value: 'comments-o' },
					{ name: 'Crosshairs', value: 'crosshairs' },
					{ name: 'Dashboard', value: 'dashboard' },
					{ name: 'Envelope', value: 'envelope' },
					{ name: 'Fire', value: 'fire' },
					{ name: 'Flag', value: 'flag' },
					{ name: 'Flask', value: 'flask' },
					{ name: 'Globe', value: 'globe' },
					{ name: 'Heart', value: 'heart' },
					{ name: 'Leaf', value: 'leaf' },
					{ name: 'Legal', value: 'legal' },
					{ name: 'Life Ring', value: 'life-ring' },
					{ name: 'Line Chart', value: 'line-chart' },
					{ name: 'Magic', value: 'magic' },
					{ name: 'Mobile', value: 'mobile' },
					{ name: 'Money', value: 'money' },
					{ name: 'None', value: 'none' },
					{ name: 'Paper Plane', value: 'paper-plane' },
					{ name: 'Pie Chart', value: 'pie-chart' },
					{ name: 'Puzzle Piece', value: 'puzzle-piece' },
					{ name: 'Road', value: 'road' },
					{ name: 'Rocket', value: 'rocket' },
					{ name: 'Shopping Cart', value: 'shopping-cart' },
					{ name: 'Sitemap', value: 'sitemap' },
					{ name: 'Sliders', value: 'sliders' },
					{ name: 'Tablet', value: 'tablet' },
					{ name: 'Thumbs Down', value: 'thumbs-down' },
					{ name: 'Thumbs Up', value: 'thumbs-up' },
					{ name: 'Trophy', value: 'trophy' },
					{ name: 'USD', value: 'usd' },
					{ name: 'User', value: 'user' },
					{ name: 'Users', value: 'users' },
				],
				default: 'bar-chart',
				description: 'Dashboard icon',
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
				resource: ['dashboard'],
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
				resource: ['dashboard'],
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
				resource: ['dashboard'],
				operation: ['getAll'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Category',
				name: 'category',
				type: 'options',
				options: [
					{ name: 'All', value: '' },
					{ name: 'Created by Me', value: 'mine' },
					{ name: 'Favorites', value: 'favorite' },
				],
				default: '',
				description: 'Filter by dashboard category',
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				description: 'Filter by title (partial match)',
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
				resource: ['dashboard'],
				operation: ['update'],
			},
		},
		default: {},
		options: [
			{
				displayName: 'Editable',
				name: 'editable',
				type: 'options',
				options: [
					{ name: 'Editable by All', value: 'editable_by_all' },
					{ name: 'Editable by Owner', value: 'editable_by_owner' },
					{ name: 'Read Only', value: 'read_only' },
				],
				default: 'editable_by_owner',
				description: 'Dashboard edit permission',
			},
			{
				displayName: 'Icon',
				name: 'icon',
				type: 'string',
				default: '',
				description: 'Dashboard icon',
			},
			{
				displayName: 'Title',
				name: 'title',
				type: 'string',
				default: '',
				description: 'New title for the dashboard',
			},
			{
				displayName: 'Visibility',
				name: 'visibility',
				type: 'options',
				options: [
					{ name: 'All', value: 'all' },
					{ name: 'Owner', value: 'owner' },
				],
				default: 'all',
				description: 'Dashboard visibility',
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
			const title = this.getNodeParameter('title', index) as string;
			const visibility = this.getNodeParameter('visibility', index) as string;
			const editable = this.getNodeParameter('editable', index) as string;
			const widgetsData = this.getNodeParameter('widgets', index) as IDataObject;
			const additionalOptions = this.getNodeParameter('additionalOptions', index, {}) as IDataObject;

			const widgetsList = (widgetsData.widget as IDataObject[]) || [];
			const widgets = widgetsList.map((w) => ({
				visualization: w.visualization,
				account_id: w.accountId,
				data: [
					{
						nrql: w.nrql,
					},
				],
				presentation: {
					title: w.title,
					notes: w.notes || null,
				},
				layout: {
					width: w.width || 1,
					height: w.height || 1,
					row: w.row || 1,
					column: w.column || 1,
				},
			}));

			const body = {
				dashboard: {
					title,
					visibility,
					editable,
					widgets,
					...(additionalOptions.icon && { icon: additionalOptions.icon }),
				},
			};

			const response = await newRelicApiRequest.call(
				this,
				'POST',
				'/dashboards.json',
				body,
			);
			return response.dashboard as IDataObject;
		}

		case 'getAll': {
			const returnAll = this.getNodeParameter('returnAll', index) as boolean;
			const filters = this.getNodeParameter('filters', index, {}) as IDataObject;
			const query: IDataObject = {};

			if (filters.title) {
				query['filter[title]'] = filters.title;
			}
			if (filters.category) {
				query.category = filters.category;
			}

			if (returnAll) {
				return await newRelicApiRequestAllItems.call(
					this,
					'dashboards',
					'GET',
					'/dashboards.json',
					{},
					query,
				);
			} else {
				const limit = this.getNodeParameter('limit', index) as number;
				const response = await newRelicApiRequest.call(
					this,
					'GET',
					'/dashboards.json',
					{},
					query,
				);
				const dashboards = response.dashboards as IDataObject[];
				return dashboards.slice(0, limit);
			}
		}

		case 'get': {
			const dashboardId = this.getNodeParameter('dashboardId', index) as string;
			const response = await newRelicApiRequest.call(
				this,
				'GET',
				`/dashboards/${dashboardId}.json`,
			);
			return response.dashboard as IDataObject;
		}

		case 'update': {
			const dashboardId = this.getNodeParameter('dashboardId', index) as string;
			const updateFields = this.getNodeParameter('updateFields', index, {}) as IDataObject;

			// Get existing dashboard
			const existingResponse = await newRelicApiRequest.call(
				this,
				'GET',
				`/dashboards/${dashboardId}.json`,
			);
			const existingDashboard = existingResponse.dashboard as IDataObject;

			const body = {
				dashboard: {
					...existingDashboard,
					...(updateFields.title && { title: updateFields.title }),
					...(updateFields.visibility && { visibility: updateFields.visibility }),
					...(updateFields.editable && { editable: updateFields.editable }),
					...(updateFields.icon && { icon: updateFields.icon }),
				},
			};

			const response = await newRelicApiRequest.call(
				this,
				'PUT',
				`/dashboards/${dashboardId}.json`,
				body,
			);
			return response.dashboard as IDataObject;
		}

		case 'delete': {
			const dashboardId = this.getNodeParameter('dashboardId', index) as string;
			await newRelicApiRequest.call(
				this,
				'DELETE',
				`/dashboards/${dashboardId}.json`,
			);
			return { success: true, dashboardId };
		}

		default:
			throw new Error(`Operation ${operation} is not supported`);
	}
}
