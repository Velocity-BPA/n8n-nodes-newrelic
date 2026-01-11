/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

export interface IDataObject {
	[key: string]: any;
}

export interface INodeExecutionData {
	json: IDataObject;
	binary?: any;
	pairedItem?: any;
}

export interface INodeProperties {
	displayName: string;
	name: string;
	type: string;
	default?: any;
	required?: boolean;
	displayOptions?: any;
	options?: any[];
	description?: string;
	placeholder?: string;
	noDataExpression?: boolean;
	typeOptions?: any;
}

export interface INodeTypeDescription {
	displayName: string;
	name: string;
	icon?: string;
	group: string[];
	version: number;
	subtitle?: string;
	description: string;
	defaults: {
		name: string;
	};
	inputs: string[];
	outputs: string[];
	credentials?: any[];
	properties: INodeProperties[];
	webhooks?: any[];
}

export interface INodeType {
	description: INodeTypeDescription;
	execute?(this: any): Promise<INodeExecutionData[][]>;
	webhook?(this: any): Promise<any>;
}

export interface IExecuteFunctions {
	getInputData(): INodeExecutionData[];
	getNodeParameter(parameterName: string, itemIndex: number, fallbackValue?: any): any;
	getCredentials(type: string): Promise<IDataObject>;
	helpers: {
		request(options: any): Promise<any>;
		returnJsonArray(data: any[]): INodeExecutionData[];
	};
	continueOnFail(): boolean;
}

export interface IHookFunctions {
	getCredentials(type: string): Promise<IDataObject>;
	getWebhookUrl(webhook: string): string;
}

export interface IWebhookFunctions {
	getRequestObject(): any;
	getBodyData(): IDataObject;
	getNodeParameter(parameterName: string, fallbackValue?: any): any;
	helpers: {
		returnJsonArray(data: any[]): INodeExecutionData[];
	};
}

export interface IWebhookResponseData {
	workflowData?: INodeExecutionData[][];
	noWebhookResponse?: boolean;
}

export class NodeApiError extends Error {
	constructor(
		_node: any,
		error: any,
		options?: { message?: string; description?: string },
	) {
		super(options?.message || error.message);
		this.name = 'NodeApiError';
	}
}

export class NodeOperationError extends Error {
	constructor(_node: any, message: string) {
		super(message);
		this.name = 'NodeOperationError';
	}
}
