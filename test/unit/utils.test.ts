/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
	buildFilterQuery,
	buildLabelKey,
	parseLabelKey,
	cleanObject,
	simplifyResponse,
} from '../../nodes/NewRelic/utils';

describe('Utility Functions', () => {
	describe('buildFilterQuery', () => {
		it('should build filter query parameters', () => {
			const filters = {
				name: 'test-app',
				language: 'java',
			};
			const result = buildFilterQuery(filters);
			expect(result).toEqual({
				'filter[name]': 'test-app',
				'filter[language]': 'java',
			});
		});

		it('should skip undefined and empty values', () => {
			const filters = {
				name: 'test-app',
				language: '',
				ids: undefined,
			};
			const result = buildFilterQuery(filters);
			expect(result).toEqual({
				'filter[name]': 'test-app',
			});
		});

		it('should return empty object for empty filters', () => {
			const result = buildFilterQuery({});
			expect(result).toEqual({});
		});
	});

	describe('buildLabelKey', () => {
		it('should build label key from category and name', () => {
			const result = buildLabelKey('Environment', 'Production');
			expect(result).toBe('Environment:Production');
		});

		it('should handle special characters', () => {
			const result = buildLabelKey('My Category', 'My Name');
			expect(result).toBe('My Category:My Name');
		});
	});

	describe('parseLabelKey', () => {
		it('should parse label key into category and name', () => {
			const result = parseLabelKey('Environment:Production');
			expect(result).toEqual({
				category: 'Environment',
				name: 'Production',
			});
		});

		it('should handle colons in name', () => {
			const result = parseLabelKey('Category:Name:With:Colons');
			expect(result).toEqual({
				category: 'Category',
				name: 'Name:With:Colons',
			});
		});

		it('should throw error for invalid format', () => {
			expect(() => parseLabelKey('InvalidFormat')).toThrow('Invalid label key format');
		});
	});

	describe('cleanObject', () => {
		it('should remove undefined and null values', () => {
			const obj = {
				a: 'value',
				b: undefined,
				c: null,
				d: 0,
				e: false,
				f: '',
			};
			const result = cleanObject(obj);
			expect(result).toEqual({
				a: 'value',
				d: 0,
				e: false,
				f: '',
			});
		});

		it('should return empty object for all null/undefined', () => {
			const obj = {
				a: undefined,
				b: null,
			};
			const result = cleanObject(obj);
			expect(result).toEqual({});
		});
	});

	describe('simplifyResponse', () => {
		it('should simplify nested response', () => {
			const response = {
				application: {
					id: 123,
					name: 'Test App',
				},
			};
			const result = simplifyResponse(response, 'application');
			expect(result).toEqual({
				id: 123,
				name: 'Test App',
			});
		});

		it('should return original if key not found', () => {
			const response = {
				other: 'data',
			};
			const result = simplifyResponse(response, 'application');
			expect(result).toEqual({
				other: 'data',
			});
		});

		it('should handle array responses', () => {
			const response = {
				applications: [
					{ id: 1, name: 'App 1' },
					{ id: 2, name: 'App 2' },
				],
			};
			const result = simplifyResponse(response, 'applications');
			expect(result).toEqual([
				{ id: 1, name: 'App 1' },
				{ id: 2, name: 'App 2' },
			]);
		});
	});
});
