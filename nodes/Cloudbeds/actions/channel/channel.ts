/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { cloudbedsApiRequest, cloudbedsApiRequestAllItems } from '../../transport/CloudbedsClient';

export const description: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['channel'],
      },
    },
    options: [
      {
        name: 'Get Connections',
        value: 'getConnections',
        description: 'Get all channel connections',
        action: 'Get channel connections',
      },
      {
        name: 'Get Rate Mappings',
        value: 'getRateMappings',
        description: 'Get rate mappings for a channel',
        action: 'Get rate mappings',
      },
      {
        name: 'Get Inventory Mappings',
        value: 'getInventoryMappings',
        description: 'Get inventory mappings for a channel',
        action: 'Get inventory mappings',
      },
      {
        name: 'Sync Availability',
        value: 'syncAvailability',
        description: 'Sync availability to channel',
        action: 'Sync availability',
      },
      {
        name: 'Sync Rates',
        value: 'syncRates',
        description: 'Sync rates to channel',
        action: 'Sync rates',
      },
    ],
    default: 'getConnections',
  },
  {
    displayName: 'Property ID',
    name: 'propertyID',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['channel'],
      },
    },
    description: 'The ID of the property',
  },
  {
    displayName: 'Channel ID',
    name: 'channelID',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['channel'],
        operation: [
          'getRateMappings',
          'getInventoryMappings',
          'syncAvailability',
          'syncRates',
        ],
      },
    },
    description: 'The ID of the channel (e.g., booking.com, expedia)',
  },
  {
    displayName: 'Mapping ID',
    name: 'mappingID',
    type: 'string',
    default: '',
    displayOptions: {
      show: {
        resource: ['channel'],
        operation: ['getRateMappings', 'getInventoryMappings'],
      },
    },
    description: 'Filter by specific mapping ID (optional)',
  },
  {
    displayName: 'Start Date',
    name: 'startDate',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['channel'],
        operation: ['syncAvailability', 'syncRates'],
      },
    },
    description: 'Start date for sync (YYYY-MM-DD)',
    placeholder: '2024-01-01',
  },
  {
    displayName: 'End Date',
    name: 'endDate',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['channel'],
        operation: ['syncAvailability', 'syncRates'],
      },
    },
    description: 'End date for sync (YYYY-MM-DD)',
    placeholder: '2024-01-31',
  },
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    displayOptions: {
      show: {
        resource: ['channel'],
        operation: ['getConnections', 'getRateMappings', 'getInventoryMappings'],
      },
    },
    description: 'Whether to return all results or only up to a given limit',
  },
  {
    displayName: 'Limit',
    name: 'limit',
    type: 'number',
    default: 50,
    typeOptions: {
      minValue: 1,
      maxValue: 100,
    },
    displayOptions: {
      show: {
        resource: ['channel'],
        operation: ['getConnections', 'getRateMappings', 'getInventoryMappings'],
        returnAll: [false],
      },
    },
    description: 'Max number of results to return',
  },
  {
    displayName: 'Sync Options',
    name: 'syncOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        resource: ['channel'],
        operation: ['syncAvailability', 'syncRates'],
      },
    },
    options: [
      {
        displayName: 'Room Type ID',
        name: 'roomTypeID',
        type: 'string',
        default: '',
        description: 'Sync only specific room type',
      },
      {
        displayName: 'Rate Plan ID',
        name: 'ratePlanID',
        type: 'string',
        default: '',
        description: 'Sync only specific rate plan',
      },
      {
        displayName: 'Force Sync',
        name: 'forceSync',
        type: 'boolean',
        default: false,
        description: 'Whether to force sync even if no changes detected',
      },
    ],
  },
  {
    displayName: 'Connection Filters',
    name: 'connectionFilters',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: {
      show: {
        resource: ['channel'],
        operation: ['getConnections'],
      },
    },
    options: [
      {
        displayName: 'Status',
        name: 'status',
        type: 'options',
        options: [
          { name: 'All', value: '' },
          { name: 'Active', value: 'active' },
          { name: 'Inactive', value: 'inactive' },
          { name: 'Pending', value: 'pending' },
        ],
        default: '',
        description: 'Filter by connection status',
      },
      {
        displayName: 'Channel Type',
        name: 'channelType',
        type: 'options',
        options: [
          { name: 'All', value: '' },
          { name: 'OTA', value: 'ota' },
          { name: 'GDS', value: 'gds' },
          { name: 'Metasearch', value: 'metasearch' },
        ],
        default: '',
        description: 'Filter by channel type',
      },
    ],
  },
];

export async function execute(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData[]> {
  const returnData: INodeExecutionData[] = [];

  for (let i = 0; i < items.length; i++) {
    try {
      const operation = this.getNodeParameter('operation', i) as string;
      const propertyID = this.getNodeParameter('propertyID', i) as string;
      let response;

      switch (operation) {
        case 'getConnections': {
          const returnAll = this.getNodeParameter('returnAll', i) as boolean;
          const connectionFilters = this.getNodeParameter('connectionFilters', i) as Record<
            string,
            unknown
          >;

          const query = {
            propertyID,
            ...connectionFilters,
          };

          if (returnAll) {
            const data = await cloudbedsApiRequestAllItems.call(
              this,
              'GET',
              '/getChannelConnections',
              undefined,
              query,
            );
            response = { data };
          } else {
            const limit = this.getNodeParameter('limit', i) as number;
            response = await cloudbedsApiRequest.call(
              this,
              'GET',
              '/getChannelConnections',
              undefined,
              {
                ...query,
                pageSize: limit,
              },
            );
          }
          break;
        }

        case 'getRateMappings': {
          const channelID = this.getNodeParameter('channelID', i) as string;
          const mappingID = this.getNodeParameter('mappingID', i, '') as string;
          const returnAll = this.getNodeParameter('returnAll', i) as boolean;

          const query = {
            propertyID,
            channelID,
            mappingID: mappingID || undefined,
          };

          if (returnAll) {
            const data = await cloudbedsApiRequestAllItems.call(
              this,
              'GET',
              '/getChannelRateMappings',
              undefined,
              query,
            );
            response = { data };
          } else {
            const limit = this.getNodeParameter('limit', i) as number;
            response = await cloudbedsApiRequest.call(
              this,
              'GET',
              '/getChannelRateMappings',
              undefined,
              {
                ...query,
                pageSize: limit,
              },
            );
          }
          break;
        }

        case 'getInventoryMappings': {
          const channelID = this.getNodeParameter('channelID', i) as string;
          const mappingID = this.getNodeParameter('mappingID', i, '') as string;
          const returnAll = this.getNodeParameter('returnAll', i) as boolean;

          const query = {
            propertyID,
            channelID,
            mappingID: mappingID || undefined,
          };

          if (returnAll) {
            const data = await cloudbedsApiRequestAllItems.call(
              this,
              'GET',
              '/getChannelInventoryMappings',
              undefined,
              query,
            );
            response = { data };
          } else {
            const limit = this.getNodeParameter('limit', i) as number;
            response = await cloudbedsApiRequest.call(
              this,
              'GET',
              '/getChannelInventoryMappings',
              undefined,
              {
                ...query,
                pageSize: limit,
              },
            );
          }
          break;
        }

        case 'syncAvailability': {
          const channelID = this.getNodeParameter('channelID', i) as string;
          const startDate = this.getNodeParameter('startDate', i) as string;
          const endDate = this.getNodeParameter('endDate', i) as string;
          const syncOptions = this.getNodeParameter('syncOptions', i) as Record<string, unknown>;

          response = await cloudbedsApiRequest.call(this, 'POST', '/postChannelAvailabilitySync', {
            propertyID,
            channelID,
            startDate,
            endDate,
            ...syncOptions,
          });
          break;
        }

        case 'syncRates': {
          const channelID = this.getNodeParameter('channelID', i) as string;
          const startDate = this.getNodeParameter('startDate', i) as string;
          const endDate = this.getNodeParameter('endDate', i) as string;
          const syncOptions = this.getNodeParameter('syncOptions', i) as Record<string, unknown>;

          response = await cloudbedsApiRequest.call(this, 'POST', '/postChannelRatesSync', {
            propertyID,
            channelID,
            startDate,
            endDate,
            ...syncOptions,
          });
          break;
        }

        default:
          throw new Error(`Unknown operation: ${operation}`);
      }

      const data = response.data || response;
      if (Array.isArray(data)) {
        returnData.push(...data.map((item) => ({ json: item as IDataObject })));
      } else {
        returnData.push({ json: data as IDataObject });
      }
    } catch (error) {
      if (this.continueOnFail()) {
        returnData.push({
          json: { error: error instanceof Error ? error.message : 'Unknown error' },
          pairedItem: { item: i },
        });
        continue;
      }
      throw error;
    }
  }

  return returnData;
}
