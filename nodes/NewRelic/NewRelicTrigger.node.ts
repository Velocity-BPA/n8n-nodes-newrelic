/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type {
	IDataObject,
	IHookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookFunctions,
	IWebhookResponseData,
} from 'n8n-workflow';

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

export class NewRelicTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'New Relic Trigger',
		name: 'newRelicTrigger',
		icon: 'file:newrelic.svg',
		group: ['trigger'],
		version: 1,
		subtitle: '={{$parameter["events"].join(", ")}}',
		description: 'Handle New Relic webhook notifications for alerts and incidents',
		defaults: {
			name: 'New Relic Trigger',
		},
		inputs: [],
		outputs: ['main'],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Events',
				name: 'events',
				type: 'multiOptions',
				required: true,
				default: [],
				options: [
					{
						name: 'Alert Acknowledged',
						value: 'alert_acknowledged',
						description: 'Triggered when an alert is acknowledged',
					},
					{
						name: 'Alert Closed',
						value: 'alert_closed',
						description: 'Triggered when an alert condition resolves',
					},
					{
						name: 'Alert Opened',
						value: 'alert_opened',
						description: 'Triggered when an alert condition triggers',
					},
					{
						name: 'Deployment Recorded',
						value: 'deployment_recorded',
						description: 'Triggered when a deployment marker is recorded',
					},
					{
						name: 'Incident Created',
						value: 'incident_created',
						description: 'Triggered when a new incident is created',
					},
					{
						name: 'Incident Updated',
						value: 'incident_updated',
						description: 'Triggered when incident status changes',
					},
				],
				description: 'Events to listen for',
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Policy Filter',
						name: 'policyFilter',
						type: 'string',
						default: '',
						description: 'Only process events from specific policy names (comma-separated)',
					},
					{
						displayName: 'Condition Filter',
						name: 'conditionFilter',
						type: 'string',
						default: '',
						description: 'Only process events from specific condition names (comma-separated)',
					},
					{
						displayName: 'Priority Filter',
						name: 'priorityFilter',
						type: 'multiOptions',
						default: [],
						options: [
							{ name: 'Critical', value: 'critical' },
							{ name: 'Warning', value: 'warning' },
						],
						description: 'Only process events with specific priorities',
					},
				],
			},
		],
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				// Webhook setup is manual in New Relic
				// Return true to indicate webhook can be activated
				return true;
			},
			async create(this: IHookFunctions): Promise<boolean> {
				// Emit licensing notice
				emitLicenseNotice();
				// Webhook URL needs to be manually configured in New Relic
				// as a notification channel
				return true;
			},
			async delete(this: IHookFunctions): Promise<boolean> {
				// Webhook cleanup is manual in New Relic
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		// Emit licensing notice
		emitLicenseNotice();

		const body = this.getBodyData() as IDataObject;
		const events = this.getNodeParameter('events', []) as string[];
		const options = this.getNodeParameter('options', {}) as IDataObject;

		// Determine event type from payload
		let eventType = 'unknown';
		
		if (body.current_state) {
			const state = (body.current_state as string).toLowerCase();
			if (state === 'open') {
				eventType = 'alert_opened';
			} else if (state === 'acknowledged') {
				eventType = 'alert_acknowledged';
			} else if (state === 'closed') {
				eventType = 'alert_closed';
			}
		} else if (body.incident_id && body.event) {
			const event = (body.event as string).toLowerCase();
			if (event === 'create' || event === 'created') {
				eventType = 'incident_created';
			} else if (event === 'update' || event === 'updated') {
				eventType = 'incident_updated';
			}
		} else if (body.deployment || body.revision) {
			eventType = 'deployment_recorded';
		}

		// Check if event type is in the list of events to listen for
		if (events.length > 0 && !events.includes(eventType)) {
			return {
				noWebhookResponse: true,
			};
		}

		// Apply filters
		if (options.policyFilter) {
			const policyFilters = (options.policyFilter as string).split(',').map((p) => p.trim().toLowerCase());
			const policyName = ((body.policy_name || body.policyName || '') as string).toLowerCase();
			if (policyName && !policyFilters.some((f) => policyName.includes(f))) {
				return {
					noWebhookResponse: true,
				};
			}
		}

		if (options.conditionFilter) {
			const conditionFilters = (options.conditionFilter as string).split(',').map((c) => c.trim().toLowerCase());
			const conditionName = ((body.condition_name || body.conditionName || '') as string).toLowerCase();
			if (conditionName && !conditionFilters.some((f) => conditionName.includes(f))) {
				return {
					noWebhookResponse: true,
				};
			}
		}

		if (options.priorityFilter && (options.priorityFilter as string[]).length > 0) {
			const priorityFilters = options.priorityFilter as string[];
			const priority = ((body.priority || body.severity || '') as string).toLowerCase();
			if (priority && !priorityFilters.includes(priority)) {
				return {
					noWebhookResponse: true,
				};
			}
		}

		// Normalize payload
		const normalizedPayload: IDataObject = {
			eventType,
			timestamp: body.timestamp || new Date().toISOString(),
			policyName: body.policy_name || body.policyName,
			policyId: body.policy_id || body.policyId,
			conditionName: body.condition_name || body.conditionName,
			conditionId: body.condition_id || body.conditionId,
			currentState: body.current_state || body.currentState,
			details: body.details || body.message,
			incidentId: body.incident_id || body.incidentId,
			incidentUrl: body.incident_url || body.incidentUrl,
			accountId: body.account_id || body.accountId,
			accountName: body.account_name || body.accountName,
			targets: body.targets,
			priority: body.priority || body.severity,
			// Include raw payload for advanced processing
			rawPayload: body,
		};

		return {
			workflowData: [
				this.helpers.returnJsonArray([normalizedPayload]),
			],
		};
	}
}
