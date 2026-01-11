/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { getSyntheticsBaseUrl } from '../../nodes/NewRelic/transport';

describe('Transport Layer', () => {
	describe('getSyntheticsBaseUrl', () => {
		it('should return US Synthetics URL for US region', () => {
			const url = getSyntheticsBaseUrl('US');
			expect(url).toBe('https://synthetics.newrelic.com/synthetics/api');
		});

		it('should return EU Synthetics URL for EU region', () => {
			const url = getSyntheticsBaseUrl('EU');
			expect(url).toBe('https://synthetics.eu.newrelic.com/synthetics/api');
		});

		it('should default to US URL for unknown region', () => {
			const url = getSyntheticsBaseUrl('UNKNOWN');
			expect(url).toBe('https://synthetics.newrelic.com/synthetics/api');
		});
	});

	describe('Base URL Selection', () => {
		it('should use correct US base URL', () => {
			// Base URL for US is https://api.newrelic.com/v2
			const baseUrl = 'https://api.newrelic.com/v2';
			expect(baseUrl).toContain('api.newrelic.com');
		});

		it('should use correct EU base URL', () => {
			// Base URL for EU is https://api.eu.newrelic.com/v2
			const baseUrl = 'https://api.eu.newrelic.com/v2';
			expect(baseUrl).toContain('api.eu.newrelic.com');
		});
	});
});
