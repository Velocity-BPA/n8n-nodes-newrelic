/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	IHttpRequestMethods,
	ILoadOptionsFunctions,
	IRequestOptions,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError } from 'n8n-workflow';

/**
 * Get the base URL based on region
 */
export function getBaseUrl(region: string): string {
	return region === 'EU'
		? 'https://api.eu.newrelic.com/v2'
		: 'https://api.newrelic.com/v2';
}

/**
 * Get the Synthetics API base URL based on region
 */
export function getSyntheticsBaseUrl(region: string): string {
	return region === 'EU'
		? 'https://synthetics.eu.newrelic.com/synthetics/api'
		: 'https://synthetics.newrelic.com/synthetics/api';
}

/**
 * Make an API request to New Relic
 */
export async function newRelicApiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions | IHookFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	query: IDataObject = {},
	uri?: string,
	useSyntheticsApi = false,
): Promise<IDataObject> {
	const credentials = await this.getCredentials('newRelicApi');
	const region = credentials.region as string;
	
	const baseUrl = useSyntheticsApi
		? getSyntheticsBaseUrl(region)
		: getBaseUrl(region);

	const options: IRequestOptions = {
		method,
		uri: uri || `${baseUrl}${endpoint}`,
		headers: {
			'Api-Key': credentials.apiKey as string,
			'Content-Type': 'application/json',
		},
		json: true,
	};

	if (Object.keys(body).length > 0) {
		options.body = body;
	}

	if (Object.keys(query).length > 0) {
		options.qs = query;
	}

	try {
		const response = await this.helpers.request(options);
		return response as IDataObject;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject, {
			message: parseErrorMessage(error),
		});
	}
}

/**
 * Make an API request and return all items using pagination
 */
export async function newRelicApiRequestAllItems(
	this: IExecuteFunctions | ILoadOptionsFunctions,
	propertyName: string,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	query: IDataObject = {},
): Promise<IDataObject[]> {
	const returnData: IDataObject[] = [];
	let responseData: IDataObject;
	let page = 1;

	query = { ...query };

	do {
		query.page = page;
		responseData = await newRelicApiRequest.call(this, method, endpoint, body, query);
		
		const items = responseData[propertyName];
		if (Array.isArray(items)) {
			returnData.push(...items);
		}
		page++;
	} while (
		responseData[propertyName] &&
		Array.isArray(responseData[propertyName]) &&
		(responseData[propertyName] as IDataObject[]).length > 0
	);

	return returnData;
}

/**
 * Parse error message from API response
 */
function parseErrorMessage(error: unknown): string {
	const err = error as IDataObject;
	
	if (err.error && typeof err.error === 'object') {
		const errorObj = err.error as IDataObject;
		if (errorObj.title) {
			return errorObj.title as string;
		}
	}
	
	if (err.message) {
		return err.message as string;
	}
	
	if (err.statusCode) {
		switch (err.statusCode) {
			case 400:
				return 'Bad Request: Invalid parameters or malformed request';
			case 401:
				return 'Unauthorized: Invalid or missing API key';
			case 403:
				return 'Forbidden: API key lacks required permissions';
			case 404:
				return 'Not Found: Resource does not exist';
			case 429:
				return 'Too Many Requests: Rate limit exceeded. Please try again later.';
			case 500:
				return 'Internal Server Error: New Relic server error';
			default:
				return `Unknown error (status code: ${err.statusCode})`;
		}
	}
	
	return 'Unknown error occurred';
}

/**
 * Implement exponential backoff with jitter for rate limiting
 */
export async function retryWithBackoff<T>(
	fn: () => Promise<T>,
	maxRetries = 5,
	baseDelay = 1000,
): Promise<T> {
	let lastError: Error | undefined;
	
	for (let attempt = 0; attempt < maxRetries; attempt++) {
		try {
			return await fn();
		} catch (error) {
			lastError = error as Error;
			const err = error as IDataObject;
			
			// Only retry on rate limit errors
			if (err.statusCode !== 429) {
				throw error;
			}
			
			// Calculate delay with exponential backoff and jitter
			const delay = Math.min(baseDelay * Math.pow(2, attempt), 32000);
			const jitter = delay * 0.1 * Math.random();
			await sleep(delay + jitter);
		}
	}
	
	throw lastError;
}

/**
 * Sleep for a specified number of milliseconds
 */
function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Validate required fields
 */
export function validateRequiredFields(
	data: IDataObject,
	requiredFields: string[],
): void {
	for (const field of requiredFields) {
		if (data[field] === undefined || data[field] === null || data[field] === '') {
			throw new Error(`Missing required field: ${field}`);
		}
	}
}

/**
 * Clean object by removing undefined/null values
 */
export function cleanObject(obj: IDataObject): IDataObject {
	const cleaned: IDataObject = {};
	
	for (const [key, value] of Object.entries(obj)) {
		if (value !== undefined && value !== null && value !== '') {
			cleaned[key] = value;
		}
	}
	
	return cleaned;
}

/**
 * Format datetime for API requests
 */
export function formatDateTime(date: string | Date): string {
	const d = typeof date === 'string' ? new Date(date) : date;
	return d.toISOString();
}

/**
 * Parse metric names array from comma-separated string
 */
export function parseMetricNames(names: string): string[] {
	return names.split(',').map((name) => name.trim()).filter((name) => name.length > 0);
}
