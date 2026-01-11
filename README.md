# n8n-nodes-newrelic

> [Velocity BPA Licensing Notice]
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for New Relic APM and observability platform, enabling workflow automation for application performance monitoring, alerting, dashboards, synthetics, and NRQL queries.

![n8n](https://img.shields.io/badge/n8n-community--node-orange)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)
![New Relic](https://img.shields.io/badge/New%20Relic-APM-1CE783)

## Features

- **12 Resource Categories** - Full coverage of New Relic APM, alerting, and observability features
- **65+ Operations** - Comprehensive CRUD operations across all resources
- **Multi-Region Support** - Both US and EU New Relic regions supported
- **Webhook Triggers** - Real-time alerting with webhook notifications
- **Synthetics Monitoring** - Create and manage synthetic monitors
- **NRQL Conditions** - Build custom alert conditions with NRQL queries
- **Dashboard Management** - Create and manage custom dashboards
- **Full TypeScript** - Complete type definitions for all resources

## Installation

### Community Nodes (Recommended)

1. Open your n8n instance
2. Go to **Settings** > **Community Nodes**
3. Search for `n8n-nodes-newrelic`
4. Click **Install**

### Manual Installation

```bash
# Navigate to your n8n installation
cd ~/.n8n

# Install the node
npm install n8n-nodes-newrelic

# Restart n8n
```

### Development Installation

```bash
# Clone the repository
git clone https://github.com/Velocity-BPA/n8n-nodes-newrelic.git
cd n8n-nodes-newrelic

# Install dependencies
npm install

# Build the project
npm run build

# Create symlink to n8n custom nodes
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-newrelic

# Restart n8n
```

## Credentials Setup

| Field | Description | Required |
|-------|-------------|----------|
| API Key | New Relic User API Key | Yes |
| Region | US or EU region | Yes |

### Obtaining an API Key

1. Log into New Relic One
2. Navigate to **Account Settings** > **API Keys**
3. Click **Create a key**
4. Select **User** key type
5. Copy and store the key securely

## Resources & Operations

### Application (9 operations)
| Operation | Description |
|-----------|-------------|
| Get All | List all applications with filters |
| Get | Get a single application by ID |
| Update | Update application settings |
| Delete | Delete an application |
| Get Metric Names | Get available metric names |
| Get Metric Data | Get metric timeslice data |
| Get Summary | Get application summary |
| Get Hosts | Get associated hosts |
| Get Instances | Get application instances |

### Alert Policy (5 operations)
| Operation | Description |
|-----------|-------------|
| Create | Create a new alert policy |
| Get All | List all alert policies |
| Get | Get a single alert policy |
| Update | Update an alert policy |
| Delete | Delete an alert policy |

### Alert Condition (5 operations)
| Operation | Description |
|-----------|-------------|
| Create | Create a new alert condition |
| Get All | List conditions for a policy |
| Get | Get a single condition |
| Update | Update a condition |
| Delete | Delete a condition |

### NRQL Condition (5 operations)
| Operation | Description |
|-----------|-------------|
| Create | Create a NRQL alert condition |
| Get All | List NRQL conditions for a policy |
| Get | Get a single NRQL condition |
| Update | Update a NRQL condition |
| Delete | Delete a NRQL condition |

### Notification Channel (7 operations)
| Operation | Description |
|-----------|-------------|
| Create | Create a notification channel |
| Get All | List all channels |
| Get | Get a single channel |
| Update | Update a channel |
| Delete | Delete a channel |
| Link to Policy | Link channel to alert policy |
| Unlink from Policy | Unlink channel from policy |

### Dashboard (5 operations)
| Operation | Description |
|-----------|-------------|
| Create | Create a new dashboard |
| Get All | List all dashboards |
| Get | Get a single dashboard |
| Update | Update a dashboard |
| Delete | Delete a dashboard |

### User (4 operations)
| Operation | Description |
|-----------|-------------|
| Get All | List all users |
| Get | Get a single user |
| Reset Password | Trigger password reset |
| Delete | Delete a user |

### Deployment (4 operations)
| Operation | Description |
|-----------|-------------|
| Create | Record a deployment marker |
| Get All | List deployments for an application |
| Get | Get a single deployment |
| Delete | Delete a deployment record |

### Key Transaction (6 operations)
| Operation | Description |
|-----------|-------------|
| Create | Create a key transaction |
| Get All | List all key transactions |
| Get | Get a single key transaction |
| Update | Update a key transaction |
| Delete | Delete a key transaction |
| Get Metric Data | Get metric data for transaction |

### Synthetics Monitor (7 operations)
| Operation | Description |
|-----------|-------------|
| Create | Create a synthetic monitor |
| Get All | List all monitors |
| Get | Get a single monitor |
| Update | Update a monitor |
| Delete | Delete a monitor |
| Get Locations | Get available locations |
| Get Results | Get monitor results |

### Label (7 operations)
| Operation | Description |
|-----------|-------------|
| Create | Create a label |
| Get All | List all labels |
| Get | Get a label by key |
| Delete | Delete a label |
| Get Applications | Get applications with label |
| Add to Application | Add label to application |
| Remove from Application | Remove label from application |

### Server (6 operations)
| Operation | Description |
|-----------|-------------|
| Get All | List all servers |
| Get | Get a single server |
| Update | Update server name |
| Delete | Delete a server |
| Get Metric Names | Get available metrics |
| Get Metric Data | Get metric data |

## Trigger Node

The **New Relic Trigger** node receives webhook notifications for:

- Alert Opened
- Alert Acknowledged
- Alert Closed
- Incident Created
- Incident Updated
- Deployment Recorded

### Webhook Setup

1. Create a webhook notification channel in New Relic
2. Use the n8n webhook URL from the trigger node
3. Link the channel to your alert policies

## Usage Examples

### Get Application Metrics

```json
{
  "resource": "application",
  "operation": "getMetricData",
  "applicationId": "12345678",
  "metricNames": "Apdex, HttpDispatcher",
  "timeRange": {
    "from": "2024-01-01T00:00:00Z",
    "to": "2024-01-02T00:00:00Z"
  }
}
```

### Create Alert Policy

```json
{
  "resource": "alertPolicy",
  "operation": "create",
  "name": "High Error Rate Policy",
  "incidentPreference": "PER_CONDITION"
}
```

### Create Synthetics Monitor

```json
{
  "resource": "synthetics",
  "operation": "create",
  "name": "Homepage Check",
  "type": "SIMPLE",
  "frequency": 5,
  "uri": "https://example.com",
  "locations": "AWS_US_EAST_1, AWS_EU_WEST_1",
  "status": "ENABLED"
}
```

## New Relic Concepts

### API Regions
- **US Region**: `https://api.newrelic.com/v2`
- **EU Region**: `https://api.eu.newrelic.com/v2`

### Incident Preferences
- **PER_POLICY**: One incident per policy
- **PER_CONDITION**: One incident per condition
- **PER_CONDITION_AND_TARGET**: One incident per condition and target

### Monitor Types
- **SIMPLE**: Basic ping monitoring
- **BROWSER**: Full browser simulation
- **SCRIPT_API**: Scripted API tests
- **SCRIPT_BROWSER**: Scripted browser tests

## Error Handling

The node handles common New Relic API errors:

| Code | Description |
|------|-------------|
| 400 | Invalid parameters |
| 401 | Invalid or missing API key |
| 403 | Insufficient permissions |
| 404 | Resource not found |
| 429 | Rate limit exceeded |
| 500 | New Relic server error |

Rate limiting is handled with exponential backoff.

## Security Best Practices

1. **API Key Security**: Store API keys securely using n8n credentials
2. **Least Privilege**: Use API keys with minimal required permissions
3. **Audit Logging**: Enable New Relic audit logs to track API usage
4. **Key Rotation**: Rotate API keys periodically

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Fix lint issues
npm run lint:fix
```

## Author

**Velocity BPA**
- Website: [velobpa.com](https://velobpa.com)
- GitHub: [Velocity-BPA](https://github.com/Velocity-BPA)

## Licensing

This n8n community node is licensed under the **Business Source License 1.1**.

### Free Use
Permitted for personal, educational, research, and internal business use.

### Commercial Use
Use of this node within any SaaS, PaaS, hosted platform, managed service,
or paid automation offering requires a commercial license.

For licensing inquiries:
**licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

Please ensure your code passes all tests and linting before submitting.

## Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/Velocity-BPA/n8n-nodes-newrelic/issues)
- **Documentation**: [New Relic API Docs](https://docs.newrelic.com/docs/apis/rest-api-v2/)
- **n8n Community**: [n8n Community Forum](https://community.n8n.io/)

## Acknowledgments

- [New Relic](https://newrelic.com) for their comprehensive observability platform
- [n8n](https://n8n.io) for the workflow automation platform
- All contributors to this project
