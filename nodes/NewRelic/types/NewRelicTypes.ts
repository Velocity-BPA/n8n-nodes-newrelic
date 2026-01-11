/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import type { IDataObject } from 'n8n-workflow';

// Application Types
export interface IApplication {
	id: number;
	name: string;
	language: string;
	health_status: string;
	reporting: boolean;
	last_reported_at: string;
	application_summary: IApplicationSummary;
	end_user_summary: IEndUserSummary;
	settings: IApplicationSettings;
	links: IApplicationLinks;
}

export interface IApplicationSummary {
	response_time: number;
	throughput: number;
	error_rate: number;
	apdex_target: number;
	apdex_score: number;
	host_count: number;
	instance_count: number;
	concurrent_instance_count: number;
}

export interface IEndUserSummary {
	response_time: number;
	throughput: number;
	apdex_target: number;
	apdex_score: number;
}

export interface IApplicationSettings {
	app_apdex_threshold: number;
	end_user_apdex_threshold: number;
	enable_real_user_monitoring: boolean;
	use_server_side_config: boolean;
}

export interface IApplicationLinks {
	application_instances: number[];
	servers: number[];
	application_hosts: number[];
}

// Alert Policy Types
export interface IAlertPolicy {
	id: number;
	incident_preference: 'PER_POLICY' | 'PER_CONDITION' | 'PER_CONDITION_AND_TARGET';
	name: string;
	created_at: number;
	updated_at: number;
}

// Alert Condition Types
export interface IAlertCondition {
	id: number;
	type: string;
	name: string;
	enabled: boolean;
	entities: number[];
	metric: string;
	runbook_url?: string;
	terms: IAlertTerm[];
	user_defined?: IUserDefinedCondition;
	gc_metric?: string;
	condition_scope?: string;
	violation_close_timer?: number;
}

export interface IAlertTerm {
	duration: string;
	operator: 'above' | 'below' | 'equal';
	priority: 'critical' | 'warning';
	threshold: string;
	time_function: 'all' | 'any';
}

export interface IUserDefinedCondition {
	metric: string;
	value_function: string;
}

// NRQL Condition Types
export interface INrqlCondition {
	id: number;
	type: string;
	name: string;
	enabled: boolean;
	nrql: INrqlQuery;
	terms: INrqlTerm[];
	value_function: 'single_value' | 'sum';
	runbook_url?: string;
	violation_time_limit_seconds: number;
	expected_groups?: number;
	ignore_overlap?: boolean;
	signal?: INrqlSignal;
	expiration?: INrqlExpiration;
}

export interface INrqlQuery {
	query: string;
	since_value?: string;
}

export interface INrqlTerm {
	duration: string;
	operator: 'above' | 'below' | 'equal';
	priority: 'critical' | 'warning';
	threshold: string;
	time_function: 'all' | 'any';
}

export interface INrqlSignal {
	aggregation_window?: string;
	evaluation_offset?: string;
	fill_option?: string;
	fill_value?: string;
}

export interface INrqlExpiration {
	expiration_duration?: string;
	open_violation_on_expiration?: boolean;
	close_violations_on_expiration?: boolean;
}

// Notification Channel Types
export interface INotificationChannel {
	id: number;
	type: 'email' | 'opsgenie' | 'pagerduty' | 'slack' | 'victorops' | 'webhook';
	name: string;
	configuration: IDataObject;
	links: {
		policy_ids: number[];
	};
}

// Dashboard Types
export interface IDashboard {
	id: number;
	title: string;
	icon: string;
	created_at: string;
	updated_at: string;
	visibility: 'owner' | 'all';
	editable: 'editable_by_owner' | 'editable_by_all' | 'read_only';
	ui_url: string;
	api_url: string;
	owner_email: string;
	metadata: IDataObject;
	widgets: IWidget[];
}

export interface IWidget {
	visualization: string;
	account_id: number;
	data: IWidgetData[];
	presentation: IWidgetPresentation;
	layout: IWidgetLayout;
}

export interface IWidgetData {
	nrql?: string;
	source?: string;
	duration?: number;
	end_time?: number;
	entity_ids?: number[];
	compare_with?: IDataObject[];
	metrics?: IDataObject[];
	raw_metric_name?: string;
	facet?: string;
	order_by?: string;
	limit?: number;
}

export interface IWidgetPresentation {
	title: string;
	notes?: string;
	drilldown_dashboard_id?: number;
	threshold?: IDataObject;
}

export interface IWidgetLayout {
	width: number;
	height: number;
	row: number;
	column: number;
}

// User Types
export interface IUser {
	id: number;
	first_name: string;
	last_name: string;
	email: string;
	role: string;
}

// Deployment Types
export interface IDeployment {
	id: number;
	revision: string;
	changelog?: string;
	description?: string;
	user?: string;
	timestamp: string;
	links: {
		application: number;
	};
}

// Key Transaction Types
export interface IKeyTransaction {
	id: number;
	name: string;
	transaction_name: string;
	health_status: string;
	reporting: boolean;
	last_reported_at: string;
	application_summary: IApplicationSummary;
	end_user_summary?: IEndUserSummary;
	links: {
		application: number;
	};
}

// Synthetics Monitor Types
export interface ISyntheticsMonitor {
	id: string;
	name: string;
	type: 'SIMPLE' | 'BROWSER' | 'SCRIPT_API' | 'SCRIPT_BROWSER';
	frequency: number;
	uri?: string;
	locations: string[];
	status: 'ENABLED' | 'MUTED' | 'DISABLED';
	slaThreshold: number;
	options?: ISyntheticsOptions;
	modifiedAt: string;
	createdAt: string;
	userId: number;
	apiVersion: string;
}

export interface ISyntheticsOptions {
	validationString?: string;
	verifySSL?: boolean;
	bypassHEADRequest?: boolean;
	treatRedirectAsFailure?: boolean;
}

export interface ISyntheticsLocation {
	name: string;
	label: string;
	private: boolean;
}

// Label Types
export interface ILabel {
	key: string;
	category: string;
	name: string;
	links: {
		applications: number[];
		servers: number[];
	};
}

// Server Types
export interface IServer {
	id: number;
	account_id: number;
	name: string;
	host: string;
	health_status: string;
	reporting: boolean;
	last_reported_at: string;
	summary: IServerSummary;
	links: {
		alert_policy: number;
	};
}

export interface IServerSummary {
	cpu: number;
	cpu_stolen: number;
	disk_io: number;
	memory: number;
	memory_used: number;
	memory_total: number;
	fullest_disk: number;
	fullest_disk_free: number;
}

// Metric Types
export interface IMetricName {
	name: string;
	values: string[];
}

export interface IMetricData {
	name: string;
	timeslices: IMetricTimeslice[];
}

export interface IMetricTimeslice {
	from: string;
	to: string;
	values: IDataObject;
}

// API Response Types
export interface INewRelicResponse<T> {
	[key: string]: T | T[];
}

export interface INewRelicError {
	error: {
		title: string;
	};
}

// Webhook Payload Types (for Trigger)
export interface IAlertWebhookPayload {
	account_id: number;
	account_name: string;
	closed_violations_count: IDataObject;
	condition_family_id: number;
	condition_id: number;
	condition_name: string;
	current_state: 'open' | 'acknowledged' | 'closed';
	details: string;
	duration: number;
	event_type: string;
	incident_acknowledge_url: string;
	incident_id: number;
	incident_url: string;
	metadata: IDataObject;
	open_violations_count: IDataObject;
	owner: string;
	policy_name: string;
	policy_url: string;
	runbook_url: string;
	severity: string;
	targets: IAlertTarget[];
	timestamp: number;
	timestamp_utc_string: string;
	violation_callback_url: string;
	violation_chart_url: string;
}

export interface IAlertTarget {
	id: string;
	name: string;
	link: string;
	labels: IDataObject;
	product: string;
	type: string;
}

// Resource and Operation Types
export type NewRelicResource = 
	| 'application'
	| 'alertPolicy'
	| 'alertCondition'
	| 'nrqlCondition'
	| 'notificationChannel'
	| 'dashboard'
	| 'user'
	| 'deployment'
	| 'keyTransaction'
	| 'synthetics'
	| 'label'
	| 'server';

export type ApplicationOperation = 
	| 'getAll'
	| 'get'
	| 'update'
	| 'delete'
	| 'getMetricNames'
	| 'getMetricData'
	| 'getSummary'
	| 'getHosts'
	| 'getInstances';

export type AlertPolicyOperation = 
	| 'create'
	| 'getAll'
	| 'get'
	| 'update'
	| 'delete';

export type AlertConditionOperation = 
	| 'create'
	| 'getAll'
	| 'get'
	| 'update'
	| 'delete';

export type NrqlConditionOperation = 
	| 'create'
	| 'getAll'
	| 'get'
	| 'update'
	| 'delete';

export type NotificationChannelOperation = 
	| 'create'
	| 'getAll'
	| 'get'
	| 'update'
	| 'delete'
	| 'linkToPolicy'
	| 'unlinkFromPolicy';

export type DashboardOperation = 
	| 'create'
	| 'getAll'
	| 'get'
	| 'update'
	| 'delete';

export type UserOperation = 
	| 'getAll'
	| 'get'
	| 'resetPassword'
	| 'delete';

export type DeploymentOperation = 
	| 'create'
	| 'getAll'
	| 'get'
	| 'delete';

export type KeyTransactionOperation = 
	| 'getAll'
	| 'get'
	| 'create'
	| 'update'
	| 'delete'
	| 'getMetricData';

export type SyntheticsOperation = 
	| 'create'
	| 'getAll'
	| 'get'
	| 'update'
	| 'delete'
	| 'getLocations'
	| 'getResults';

export type LabelOperation = 
	| 'getAll'
	| 'get'
	| 'create'
	| 'delete'
	| 'getApplications'
	| 'addToApplication'
	| 'removeFromApplication';

export type ServerOperation = 
	| 'getAll'
	| 'get'
	| 'update'
	| 'delete'
	| 'getMetricNames'
	| 'getMetricData';
