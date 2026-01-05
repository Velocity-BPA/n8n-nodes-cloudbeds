/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
  IHookFunctions,
  IWebhookFunctions,
  INodeType,
  INodeTypeDescription,
  IWebhookResponseData,
  IHttpRequestMethods,
  IHttpRequestOptions,
  NodeApiError,
} from 'n8n-workflow';

// Licensing notice - logged once per node load
const LICENSING_NOTICE = `[Velocity BPA Licensing Notice]

This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).

Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.

For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.`;

let licensingNoticeLogged = false;

const BASE_URL = 'https://hotels.cloudbeds.com/api/v1.2';

interface CloudbedsApiResponse {
  success: boolean;
  data?: unknown;
  message?: string;
  errors?: string[];
}

async function webhookApiRequest(
  context: IHookFunctions,
  method: IHttpRequestMethods,
  endpoint: string,
  body?: object,
  query?: Record<string, string | number | boolean | undefined>,
): Promise<CloudbedsApiResponse> {
  const credentials = await context.getCredentials('cloudbedsApi');

  const cleanQuery: Record<string, string | number | boolean> = {};
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== '') {
        cleanQuery[key] = value;
      }
    }
  }

  const options: IHttpRequestOptions = {
    method,
    url: `${BASE_URL}${endpoint}`,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization:
        credentials.authType === 'apiKey'
          ? `Bearer ${credentials.apiKey}`
          : `Bearer ${credentials.accessToken}`,
    },
    qs: cleanQuery,
    body,
    json: true,
  };

  try {
    const response = (await context.helpers.httpRequest(options)) as CloudbedsApiResponse;

    if (!response.success) {
      throw new NodeApiError(context.getNode(), {
        message: response.message || 'Unknown Cloudbeds API error',
        description: response.errors?.join(', ') || 'No additional error details',
      });
    }

    return response;
  } catch (error) {
    if (error instanceof NodeApiError) {
      throw error;
    }
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new NodeApiError(context.getNode(), {
      message: `Cloudbeds API request failed: ${errorMessage}`,
    });
  }
}

export class CloudbedsTrigger implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Cloudbeds Trigger',
    name: 'cloudbedsTrigger',
    icon: 'file:cloudbeds.svg',
    group: ['trigger'],
    version: 1,
    subtitle: '={{$parameter["event"]}}',
    description: 'Trigger workflows on Cloudbeds events',
    defaults: {
      name: 'Cloudbeds Trigger',
    },
    inputs: [],
    outputs: ['main'],
    credentials: [
      {
        name: 'cloudbedsApi',
        required: true,
      },
    ],
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
        displayName: 'Property ID',
        name: 'propertyID',
        type: 'string',
        default: '',
        required: true,
        description: 'The ID of the property to monitor',
      },
      {
        displayName: 'Event',
        name: 'event',
        type: 'options',
        options: [
          {
            name: 'Reservation Created',
            value: 'reservation_created',
            description: 'Triggered when a new reservation is created',
          },
          {
            name: 'Reservation Modified',
            value: 'reservation_modified',
            description: 'Triggered when a reservation is modified',
          },
          {
            name: 'Reservation Canceled',
            value: 'reservation_canceled',
            description: 'Triggered when a reservation is canceled',
          },
          {
            name: 'Guest Checked In',
            value: 'guest_checked_in',
            description: 'Triggered when a guest checks in',
          },
          {
            name: 'Guest Checked Out',
            value: 'guest_checked_out',
            description: 'Triggered when a guest checks out',
          },
          {
            name: 'Payment Received',
            value: 'payment_received',
            description: 'Triggered when a payment is received',
          },
          {
            name: 'Housekeeping Status Changed',
            value: 'housekeeping_status_changed',
            description: 'Triggered when room housekeeping status changes',
          },
          {
            name: 'Room Blocked',
            value: 'room_blocked',
            description: 'Triggered when a room is blocked',
          },
          {
            name: 'Rate Updated',
            value: 'rate_updated',
            description: 'Triggered when rates are updated',
          },
          {
            name: 'All Events',
            value: 'all',
            description: 'Triggered on any event',
          },
        ],
        default: 'reservation_created',
        description: 'The event to trigger on',
      },
      {
        displayName: 'Options',
        name: 'options',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        options: [
          {
            displayName: 'Room Type ID',
            name: 'roomTypeID',
            type: 'string',
            default: '',
            description: 'Only trigger for specific room type',
          },
          {
            displayName: 'Include Full Details',
            name: 'includeFullDetails',
            type: 'boolean',
            default: true,
            description: 'Whether to include full reservation/guest details',
          },
        ],
      },
    ],
  };

  webhookMethods = {
    default: {
      async checkExists(this: IHookFunctions): Promise<boolean> {
        const webhookData = this.getWorkflowStaticData('node');
        const webhookUrl = this.getNodeWebhookUrl('default');
        const propertyID = this.getNodeParameter('propertyID') as string;
        const event = this.getNodeParameter('event') as string;

        try {
          const response = await webhookApiRequest(this, 'GET', '/getWebhooks', undefined, {
            propertyID,
          });

          const webhooks = response.data as Array<{
            webhookID: string;
            url: string;
            event: string;
          }>;

          for (const webhook of webhooks || []) {
            if (webhook.url === webhookUrl && webhook.event === event) {
              webhookData.webhookId = webhook.webhookID;
              return true;
            }
          }

          return false;
        } catch {
          return false;
        }
      },

      async create(this: IHookFunctions): Promise<boolean> {
        // Log licensing notice once
        if (!licensingNoticeLogged) {
          console.warn(LICENSING_NOTICE);
          licensingNoticeLogged = true;
        }

        const webhookData = this.getWorkflowStaticData('node');
        const webhookUrl = this.getNodeWebhookUrl('default');
        const propertyID = this.getNodeParameter('propertyID') as string;
        const event = this.getNodeParameter('event') as string;
        const options = this.getNodeParameter('options') as Record<string, unknown>;

        try {
          const response = await webhookApiRequest(this, 'POST', '/postWebhook', {
            propertyID,
            url: webhookUrl,
            event,
            ...options,
          });

          const data = response.data as { webhookID: string };
          if (data && data.webhookID) {
            webhookData.webhookId = data.webhookID;
            return true;
          }

          return false;
        } catch (error) {
          console.error('Failed to create Cloudbeds webhook:', error);
          return false;
        }
      },

      async delete(this: IHookFunctions): Promise<boolean> {
        const webhookData = this.getWorkflowStaticData('node');
        const propertyID = this.getNodeParameter('propertyID') as string;

        if (webhookData.webhookId) {
          try {
            await webhookApiRequest(this, 'DELETE', '/deleteWebhook', {
              propertyID,
              webhookID: webhookData.webhookId,
            });
          } catch (error) {
            console.error('Failed to delete Cloudbeds webhook:', error);
            return false;
          }
        }

        delete webhookData.webhookId;
        return true;
      },
    },
  };

  async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
    const bodyData = this.getBodyData();
    const event = this.getNodeParameter('event') as string;

    // Validate event type if not listening to all events
    if (event !== 'all') {
      const receivedEvent = bodyData.event as string;
      if (receivedEvent && receivedEvent !== event) {
        // Event doesn't match, ignore this webhook
        return {
          noWebhookResponse: true,
        };
      }
    }

    return {
      workflowData: [this.helpers.returnJsonArray(bodyData)],
    };
  }
}
