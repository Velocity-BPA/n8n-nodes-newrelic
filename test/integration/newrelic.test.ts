/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { NewRelic } from '../../nodes/NewRelic/NewRelic.node';
import { NewRelicTrigger } from '../../nodes/NewRelic/NewRelicTrigger.node';

describe('NewRelic Node Integration', () => {
	describe('NewRelic Node', () => {
		let node: NewRelic;

		beforeEach(() => {
			node = new NewRelic();
		});

		it('should have correct description', () => {
			expect(node.description.displayName).toBe('New Relic');
			expect(node.description.name).toBe('newRelic');
		});

		it('should have all 12 resources', () => {
			const resourceProperty = node.description.properties.find(
				(p) => p.name === 'resource',
			);
			expect(resourceProperty).toBeDefined();
			expect(resourceProperty?.options).toHaveLength(12);
		});

		it('should include all expected resource types', () => {
			const resourceProperty = node.description.properties.find(
				(p) => p.name === 'resource',
			);
			const resourceValues = resourceProperty?.options?.map((o: any) => o.value) || [];
			
			expect(resourceValues).toContain('application');
			expect(resourceValues).toContain('alertPolicy');
			expect(resourceValues).toContain('alertCondition');
			expect(resourceValues).toContain('nrqlCondition');
			expect(resourceValues).toContain('notificationChannel');
			expect(resourceValues).toContain('dashboard');
			expect(resourceValues).toContain('user');
			expect(resourceValues).toContain('deployment');
			expect(resourceValues).toContain('keyTransaction');
			expect(resourceValues).toContain('synthetics');
			expect(resourceValues).toContain('label');
			expect(resourceValues).toContain('server');
		});

		it('should require newRelicApi credentials', () => {
			expect(node.description.credentials).toBeDefined();
			expect(node.description.credentials?.[0].name).toBe('newRelicApi');
			expect(node.description.credentials?.[0].required).toBe(true);
		});

		it('should have execute method', () => {
			expect(typeof node.execute).toBe('function');
		});
	});

	describe('NewRelicTrigger Node', () => {
		let triggerNode: NewRelicTrigger;

		beforeEach(() => {
			triggerNode = new NewRelicTrigger();
		});

		it('should have correct description', () => {
			expect(triggerNode.description.displayName).toBe('New Relic Trigger');
			expect(triggerNode.description.name).toBe('newRelicTrigger');
		});

		it('should be a trigger node', () => {
			expect(triggerNode.description.group).toContain('trigger');
		});

		it('should have webhook configuration', () => {
			expect(triggerNode.description.webhooks).toBeDefined();
			expect(triggerNode.description.webhooks).toHaveLength(1);
			expect(triggerNode.description.webhooks?.[0].httpMethod).toBe('POST');
		});

		it('should have all event types', () => {
			const eventsProperty = triggerNode.description.properties.find(
				(p) => p.name === 'events',
			);
			expect(eventsProperty).toBeDefined();
			expect(eventsProperty?.options).toHaveLength(6);
		});

		it('should have webhook method', () => {
			expect(typeof triggerNode.webhook).toBe('function');
		});
	});
});

describe('Credentials Integration', () => {
	it('should have proper credential file structure', async () => {
		// Import credential
		const credentialModule = await import(
			'../../credentials/NewRelicApi.credentials'
		);
		expect(credentialModule.NewRelicApi).toBeDefined();
	});
});
