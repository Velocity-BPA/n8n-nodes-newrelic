/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

import * as application from './actions/application';
import * as alertPolicy from './actions/alertPolicy';
import * as alertCondition from './actions/alertCondition';
import * as nrqlCondition from './actions/nrqlCondition';
import * as notificationChannel from './actions/notificationChannel';
import * as dashboard from './actions/dashboard';
import * as user from './actions/user';
import * as deployment from './actions/deployment';
import * as keyTransaction from './actions/keyTransaction';
import * as synthetics from './actions/synthetics';
import * as label from './actions/label';
import * as server from './actions/server';

/**
 * Convert IDataObject or IDataObject[] to INodeExecutionData[]
 */
function prepareOutput(data: IDataObject | IDataObject[], itemIndex: number): INodeExecutionData[] {
	if (Array.isArray(data)) {
		return data.map((item) => ({
			json: item,
			pairedItem: { item: itemIndex },
		}));
	}
	return [{ json: data, pairedItem: { item: itemIndex } }];
}

// Emit licensing notice once per node load
const LICENSING_NOTICE = `[Velocity BPA Licensing Notice]

This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).

Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.

For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.`;

let licenseNoticeEmitted = false;

function emitLicenseNotice(): void {
	if (!licenseNoticeEmitted) {
		console.warn(LICENSING_NOTICE);
		licenseNoticeEmitted = true;
	}
}

export class NewRelic implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'New Relic',
		name: 'newRelic',
		icon: 'file:newrelic.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
		description: 'Interact with New Relic APM and observability platform',
		defaults: {
			name: 'New Relic',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'newRelicApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Alert Condition',
						value: 'alertCondition',
					},
					{
						name: 'Alert Policy',
						value: 'alertPolicy',
					},
					{
						name: 'Application',
						value: 'application',
					},
					{
						name: 'Dashboard',
						value: 'dashboard',
					},
					{
						name: 'Deployment',
						value: 'deployment',
					},
					{
						name: 'Key Transaction',
						value: 'keyTransaction',
					},
					{
						name: 'Label',
						value: 'label',
					},
					{
						name: 'Notification Channel',
						value: 'notificationChannel',
					},
					{
						name: 'NRQL Condition',
						value: 'nrqlCondition',
					},
					{
						name: 'Server',
						value: 'server',
					},
					{
						name: 'Synthetics Monitor',
						value: 'synthetics',
					},
					{
						name: 'User',
						value: 'user',
					},
				],
				default: 'application',
			},
			// Application operations
			...application.description,
			// Alert Policy operations
			...alertPolicy.description,
			// Alert Condition operations
			...alertCondition.description,
			// NRQL Condition operations
			...nrqlCondition.description,
			// Notification Channel operations
			...notificationChannel.description,
			// Dashboard operations
			...dashboard.description,
			// User operations
			...user.description,
			// Deployment operations
			...deployment.description,
			// Key Transaction operations
			...keyTransaction.description,
			// Synthetics operations
			...synthetics.description,
			// Label operations
			...label.description,
			// Server operations
			...server.description,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		// Emit licensing notice
		emitLicenseNotice();

		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData: IDataObject | IDataObject[];

				switch (resource) {
					case 'application':
						responseData = await application.execute.call(this, i);
						break;
					case 'alertPolicy':
						responseData = await alertPolicy.execute.call(this, i);
						break;
					case 'alertCondition':
						responseData = await alertCondition.execute.call(this, i);
						break;
					case 'nrqlCondition':
						responseData = await nrqlCondition.execute.call(this, i);
						break;
					case 'notificationChannel':
						responseData = await notificationChannel.execute.call(this, i);
						break;
					case 'dashboard':
						responseData = await dashboard.execute.call(this, i);
						break;
					case 'user':
						responseData = await user.execute.call(this, i);
						break;
					case 'deployment':
						responseData = await deployment.execute.call(this, i);
						break;
					case 'keyTransaction':
						responseData = await keyTransaction.execute.call(this, i);
						break;
					case 'synthetics':
						responseData = await synthetics.execute.call(this, i);
						break;
					case 'label':
						responseData = await label.execute.call(this, i);
						break;
					case 'server':
						responseData = await server.execute.call(this, i);
						break;
					default:
						throw new Error(`Resource "${resource}" is not supported`);
				}

				returnData.push(...prepareOutput(responseData, i));
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: (error as Error).message,
						},
						pairedItem: { item: i },
					});
					continue;
				}
				throw error;
			}
		}

		return [returnData];
	}
}
