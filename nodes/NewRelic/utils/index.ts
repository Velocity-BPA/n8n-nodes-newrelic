/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject, IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';

/**
 * Prepare the output data structure
 */
export function prepareOutput(
	this: IExecuteFunctions,
	data: IDataObject | IDataObject[],
	itemIndex: number,
): INodeExecutionData[] {
	if (Array.isArray(data)) {
		return data.map((item) => ({
			json: item,
			pairedItem: { item: itemIndex },
		}));
	}
	return [{ json: data, pairedItem: { item: itemIndex } }];
}

/**
 * Extract nested property value
 */
export function extractProperty(obj: IDataObject, propertyPath: string): unknown {
	const parts = propertyPath.split('.');
	let current: unknown = obj;

	for (const part of parts) {
		if (current === undefined || current === null) {
			return undefined;
		}
		current = (current as IDataObject)[part];
	}

	return current;
}

/**
 * Build filter query parameters
 */
export function buildFilterQuery(filters: IDataObject): IDataObject {
	const query: IDataObject = {};

	for (const [key, value] of Object.entries(filters)) {
		if (value !== undefined && value !== null && value !== '') {
			// Handle array values for filter parameters
			if (Array.isArray(value)) {
				query[`filter[${key}]`] = value.join(',');
			} else {
				query[`filter[${key}]`] = value;
			}
		}
	}

	return query;
}

/**
 * Format metric data request parameters
 */
export function buildMetricQuery(options: IDataObject): IDataObject {
	const query: IDataObject = {};

	if (options.names) {
		const names = options.names as string[];
		names.forEach((name, index) => {
			query[`names[${index}]`] = name;
		});
	}

	if (options.values) {
		const values = options.values as string[];
		values.forEach((value, index) => {
			query[`values[${index}]`] = value;
		});
	}

	if (options.from) {
		query.from = options.from;
	}

	if (options.to) {
		query.to = options.to;
	}

	if (options.period) {
		query.period = options.period;
	}

	if (options.summarize !== undefined) {
		query.summarize = options.summarize;
	}

	if (options.raw !== undefined) {
		query.raw = options.raw;
	}

	return query;
}

/**
 * Build alert condition terms
 */
export function buildAlertTerms(termsData: IDataObject[]): IDataObject[] {
	return termsData.map((term) => ({
		duration: String(term.duration),
		operator: term.operator,
		priority: term.priority,
		threshold: String(term.threshold),
		time_function: term.timeFunction || term.time_function,
	}));
}

/**
 * Build NRQL condition configuration
 */
export function buildNrqlConfig(nrqlData: IDataObject): IDataObject {
	const config: IDataObject = {
		query: nrqlData.query,
	};

	if (nrqlData.sinceValue) {
		config.since_value = nrqlData.sinceValue;
	}

	return config;
}

/**
 * Build notification channel configuration based on type
 */
export function buildChannelConfiguration(
	type: string,
	config: IDataObject,
): IDataObject {
	switch (type) {
		case 'email':
			return {
				recipients: config.recipients,
				include_json_attachment: config.includeJsonAttachment || false,
			};
		case 'slack':
			return {
				url: config.url,
				channel: config.channel,
			};
		case 'webhook':
			return {
				base_url: config.baseUrl,
				auth_username: config.authUsername,
				auth_password: config.authPassword,
				payload_type: config.payloadType || 'application/json',
				payload: config.payload,
			};
		case 'pagerduty':
			return {
				service_key: config.serviceKey,
			};
		case 'opsgenie':
			return {
				api_key: config.apiKey,
				teams: config.teams,
				tags: config.tags,
				recipients: config.recipients,
			};
		case 'victorops':
			return {
				key: config.key,
				route_key: config.routeKey,
			};
		default:
			return config;
	}
}

/**
 * Build dashboard widget configuration
 */
export function buildWidgetConfig(widgetData: IDataObject): IDataObject {
	return {
		visualization: widgetData.visualization,
		account_id: widgetData.accountId,
		data: widgetData.data,
		presentation: {
			title: widgetData.title,
			notes: widgetData.notes,
		},
		layout: {
			width: widgetData.width || 1,
			height: widgetData.height || 1,
			row: widgetData.row || 1,
			column: widgetData.column || 1,
		},
	};
}

/**
 * Build synthetics monitor configuration
 */
export function buildSyntheticsConfig(monitorData: IDataObject): IDataObject {
	const config: IDataObject = {
		name: monitorData.name,
		type: monitorData.type,
		frequency: monitorData.frequency,
		locations: monitorData.locations,
		status: monitorData.status || 'ENABLED',
	};

	if (monitorData.uri) {
		config.uri = monitorData.uri;
	}

	if (monitorData.slaThreshold) {
		config.slaThreshold = monitorData.slaThreshold;
	}

	if (monitorData.options) {
		config.options = monitorData.options;
	}

	return config;
}

/**
 * Parse label key into category and name
 */
export function parseLabelKey(labelKey: string): { category: string; name: string } {
	const colonIndex = labelKey.indexOf(':');
	if (colonIndex === -1) {
		throw new Error('Invalid label key format. Expected Category:Name');
	}
	return {
		category: labelKey.substring(0, colonIndex),
		name: labelKey.substring(colonIndex + 1),
	};
}

/**
 * Remove undefined and null values from object
 */
export function cleanObject(obj: IDataObject): IDataObject {
	const result: IDataObject = {};
	for (const [key, value] of Object.entries(obj)) {
		if (value !== undefined && value !== null) {
			result[key] = value;
		}
	}
	return result;
}

/**
 * Build label key from category and name
 */
export function buildLabelKey(category: string, name: string): string {
	return `${category}:${name}`;
}

/**
 * Simplify response by extracting primary data
 */
export function simplifyResponse(response: IDataObject, propertyName: string): IDataObject | IDataObject[] {
	if (response[propertyName] !== undefined) {
		return response[propertyName] as IDataObject | IDataObject[];
	}
	return response;
}
