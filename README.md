# n8n-nodes-cloudbeds

> **[Velocity BPA Licensing Notice]**
>
> This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).
>
> Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.
>
> For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.

A comprehensive n8n community node for Cloudbeds hospitality property management system (PMS). This node enables workflow automation for hotel operations, reservations, guest management, housekeeping, channel management, and more.

![n8n version](https://img.shields.io/badge/n8n-%3E%3D0.200.0-blue)
![Node version](https://img.shields.io/badge/node-%3E%3D18.0.0-green)
![License](https://img.shields.io/badge/license-BSL--1.1-blue)

## Features

- **9 Resource Categories** - Properties, Reservations, Guests, Rooms, Calendar, Transactions, Housekeeping, Reports, Channel Manager
- **50+ Operations** - Comprehensive API coverage for hotel management
- **Multi-Property Support** - Manage multiple hotels from a single account
- **Dual Authentication** - OAuth 2.0 and API Key support
- **Webhook Triggers** - Real-time event notifications
- **Pagination Support** - Handle large datasets efficiently
- **Channel Manager Integration** - Sync with OTAs like Booking.com, Expedia, Airbnb

## Installation

### Community Nodes (Recommended)

1. Open n8n
2. Go to **Settings** > **Community Nodes**
3. Click **Install**
4. Enter `n8n-nodes-cloudbeds`
5. Click **Install**

### Manual Installation

```bash
# Navigate to your n8n custom nodes directory
cd ~/.n8n/custom

# Clone or extract the package
npm install n8n-nodes-cloudbeds
```

### Development Installation

```bash
# 1. Extract the zip file
unzip n8n-nodes-cloudbeds.zip
cd n8n-nodes-cloudbeds

# 2. Install dependencies
npm install

# 3. Build the project
npm run build

# 4. Create symlink to n8n custom nodes directory
# For Linux/macOS:
mkdir -p ~/.n8n/custom
ln -s $(pwd) ~/.n8n/custom/n8n-nodes-cloudbeds

# For Windows (run as Administrator):
# mklink /D %USERPROFILE%\.n8n\custom\n8n-nodes-cloudbeds %CD%

# 5. Restart n8n
n8n start
```

## Credentials Setup

### API Key Authentication

| Field | Description |
|-------|-------------|
| Auth Type | Select "API Key" |
| API Key | Your Cloudbeds API key |

### OAuth 2.0 Authentication

| Field | Description |
|-------|-------------|
| Auth Type | Select "OAuth 2.0" |
| Client ID | OAuth application client ID |
| Client Secret | OAuth application client secret |

To obtain API credentials:

1. Log in to your Cloudbeds account
2. Navigate to **Settings** > **API** > **Developer Portal**
3. Create a new application or retrieve existing credentials

## Resources & Operations

### Property

Manage properties and hotels in your Cloudbeds account.

| Operation | Description |
|-----------|-------------|
| Get Hotels | List all properties |
| Get Hotel Details | Get details for a specific property |
| Get Room Types | List room types for a property |
| Get Rooms | List individual rooms |
| Get Rate Plans | List rate plans |
| Get Amenities | List property amenities |

### Reservation

Create and manage reservations.

| Operation | Description |
|-----------|-------------|
| Create | Create a new reservation |
| Get | Get a specific reservation |
| Get All | List all reservations |
| Update | Update reservation details |
| Cancel | Cancel a reservation |
| Get By Dates | Get reservations by date range |
| Get By Status | Get reservations by status |
| Add Note | Add a note to a reservation |

**Reservation Status Values:**
- `confirmed` - Confirmed reservation
- `not_confirmed` - Pending confirmation
- `canceled` - Canceled reservation
- `checked_in` - Guest has checked in
- `checked_out` - Guest has checked out
- `no_show` - Guest did not arrive

### Guest

Manage guest profiles.

| Operation | Description |
|-----------|-------------|
| Create | Create a new guest profile |
| Get | Get guest details |
| Get All | List all guests |
| Update | Update guest information |
| Search | Search guests by criteria |
| Get By Reservation | Get guests for a reservation |

### Room

Manage rooms and availability.

| Operation | Description |
|-----------|-------------|
| Get All | List all rooms |
| Get Availability | Check room availability |
| Assign Room | Assign room to reservation |
| Unassign Room | Remove room assignment |
| Set Blocked | Block a room |
| Remove Blocked | Unblock a room |
| Set Out Of Service | Mark room out of service |
| Get Housekeeping | Get room housekeeping status |
| Update Housekeeping | Update housekeeping status |

### Calendar

Manage availability calendar and rates.

| Operation | Description |
|-----------|-------------|
| Get Calendar | Get availability calendar |
| Update Calendar | Update calendar availability |
| Get Rates | Get rates for date range |
| Update Rates | Update room rates |
| Get Restrictions | Get booking restrictions |
| Update Restrictions | Update restrictions |

### Transaction

Manage payments and charges.

| Operation | Description |
|-----------|-------------|
| Get All | List transactions |
| Add Payment | Record a payment |
| Add Charge | Add a charge |
| Void Transaction | Void a transaction |
| Get Invoice | Get invoice details |
| Email Invoice | Send invoice via email |

**Payment Methods:**
- `cash` - Cash payment
- `credit_card` - Credit card
- `debit_card` - Debit card
- `bank_transfer` - Bank transfer
- `check` - Check payment
- `other` - Other method

### Housekeeping

Manage housekeeping status and assignments.

| Operation | Description |
|-----------|-------------|
| Get Status | Get all room statuses |
| Update Status | Update room status |
| Get Assignments | Get staff assignments |
| Create Assignment | Create new assignment |

**Housekeeping Status Values:**
- `clean` - Room is clean
- `dirty` - Room needs cleaning
- `inspected` - Room has been inspected

### Report

Generate operational reports.

| Operation | Description |
|-----------|-------------|
| Get Occupancy | Occupancy report |
| Get Revenue | Revenue report |
| Get Arrivals/Departures | Daily movements |
| Get Custom Report | Run custom report |
| Get Saved Reports | List saved reports |

### Channel

Manage channel manager connections.

| Operation | Description |
|-----------|-------------|
| Get Connections | List channel connections |
| Get Rate Mappings | Get rate plan mappings |
| Get Inventory Mappings | Get inventory mappings |
| Sync Availability | Push availability to channels |
| Sync Rates | Push rates to channels |

## Trigger Node

The **Cloudbeds Trigger** node enables real-time event handling via webhooks.

### Supported Events

| Event | Description |
|-------|-------------|
| `reservation_created` | New reservation created |
| `reservation_modified` | Reservation updated |
| `reservation_canceled` | Reservation canceled |
| `guest_checked_in` | Guest check-in |
| `guest_checked_out` | Guest check-out |
| `payment_received` | Payment recorded |
| `housekeeping_status_changed` | Room status changed |
| `room_blocked` | Room blocked |
| `rate_updated` | Rate plan updated |
| `all` | All events |

## Usage Examples

### Create a Reservation

```javascript
// Cloudbeds node configuration
{
  "resource": "reservation",
  "operation": "create",
  "propertyID": "123",
  "startDate": "2024-02-01",
  "endDate": "2024-02-05",
  "roomTypeID": "456",
  "guestFirstName": "John",
  "guestLastName": "Doe",
  "guestEmail": "john.doe@example.com"
}
```

### Check Room Availability

```javascript
// Cloudbeds node configuration
{
  "resource": "room",
  "operation": "getAvailability",
  "propertyID": "123",
  "startDate": "2024-02-01",
  "endDate": "2024-02-10",
  "roomTypeID": "456"
}
```

### Update Housekeeping Status

```javascript
// Cloudbeds node configuration
{
  "resource": "housekeeping",
  "operation": "updateStatus",
  "roomID": "101",
  "status": "clean"
}
```

### Sync Channel Availability

```javascript
// Cloudbeds node configuration
{
  "resource": "channel",
  "operation": "syncAvailability",
  "propertyID": "123",
  "channelID": "1"
}
```

## API Concepts

### Multi-Property Support

Cloudbeds supports multiple properties per account. Most operations require a `propertyID` parameter. Use the "Get Hotels" operation to retrieve available property IDs.

### Rate Limits

- **120 requests per minute**
- **2 requests per second**

The node handles rate limiting automatically with appropriate retry logic.

### Date Formats

- **Dates**: `YYYY-MM-DD` (e.g., `2024-01-15`)
- **Times**: `HH:MM:SS` (e.g., `14:30:00`)
- **Timezone**: Based on property settings

### Pagination

For operations that return multiple results:
- Use `pageNumber` (0-indexed) and `pageSize` parameters
- Enable "Return All" to automatically fetch all pages
- Default page size is 100 results

## Error Handling

The node provides detailed error messages from the Cloudbeds API:

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error 1", "Detailed error 2"]
}
```

Common errors:
- `Invalid propertyID` - Property not found or no access
- `Reservation not found` - Invalid reservation ID
- `Room not available` - Room unavailable for dates
- `Rate limit exceeded` - Too many requests

## Security Best Practices

1. **Credential Storage** - Use n8n's credential management system
2. **OAuth 2.0** - Preferred for production environments
3. **API Key Rotation** - Regularly rotate API keys
4. **Minimal Permissions** - Request only necessary API scopes
5. **Audit Logging** - Enable logging for compliance

## Development

```bash
# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Fix lint issues
npm run lint:fix

# Format code
npm run format

# Watch mode for development
npm run dev
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

Use of this node within any SaaS, PaaS, hosted platform, managed service, or paid automation offering requires a commercial license.

For licensing inquiries: **licensing@velobpa.com**

See [LICENSE](LICENSE), [COMMERCIAL_LICENSE.md](COMMERCIAL_LICENSE.md), and [LICENSING_FAQ.md](LICENSING_FAQ.md) for details.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

- **Documentation**: [Cloudbeds API Docs](https://hotels.cloudbeds.com/api/docs)
- **Issues**: [GitHub Issues](https://github.com/Velocity-BPA/n8n-nodes-cloudbeds/issues)
- **Commercial Support**: [licensing@velobpa.com](mailto:licensing@velobpa.com)

## Acknowledgments

- [Cloudbeds](https://www.cloudbeds.com/) for their comprehensive hospitality platform
- [n8n](https://n8n.io/) for the workflow automation platform
- The n8n community for guidance and support
