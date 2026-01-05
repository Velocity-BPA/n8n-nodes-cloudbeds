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
        resource: ['room'],
      },
    },
    options: [
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Get all rooms',
        action: 'Get all rooms',
      },
      {
        name: 'Get Availability',
        value: 'getAvailability',
        description: 'Check room availability',
        action: 'Get room availability',
      },
      {
        name: 'Assign Room',
        value: 'assignRoom',
        description: 'Assign room to reservation',
        action: 'Assign room',
      },
      {
        name: 'Unassign Room',
        value: 'unassignRoom',
        description: 'Unassign room from reservation',
        action: 'Unassign room',
      },
      {
        name: 'Set Blocked',
        value: 'setBlocked',
        description: 'Block a room',
        action: 'Block room',
      },
      {
        name: 'Remove Blocked',
        value: 'removeBlocked',
        description: 'Unblock a room',
        action: 'Unblock room',
      },
      {
        name: 'Set Out of Service',
        value: 'setOutOfService',
        description: 'Set room out of service',
        action: 'Set out of service',
      },
      {
        name: 'Get Housekeeping',
        value: 'getHousekeeping',
        description: 'Get room housekeeping status',
        action: 'Get housekeeping status',
      },
      {
        name: 'Update Housekeeping',
        value: 'updateHousekeeping',
        description: 'Update room housekeeping status',
        action: 'Update housekeeping status',
      },
    ],
    default: 'getAll',
  },
  {
    displayName: 'Property ID',
    name: 'propertyID',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['room'],
        operation: [
          'getAll',
          'getAvailability',
          'setBlocked',
          'removeBlocked',
          'setOutOfService',
          'getHousekeeping',
        ],
      },
    },
    description: 'The ID of the property',
  },
  {
    displayName: 'Room ID',
    name: 'roomID',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['room'],
        operation: [
          'assignRoom',
          'unassignRoom',
          'setBlocked',
          'removeBlocked',
          'setOutOfService',
          'updateHousekeeping',
        ],
      },
    },
    description: 'The ID of the room',
  },
  {
    displayName: 'Reservation ID',
    name: 'reservationID',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['room'],
        operation: ['assignRoom', 'unassignRoom'],
      },
    },
    description: 'The ID of the reservation',
  },
  {
    displayName: 'Start Date',
    name: 'startDate',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['room'],
        operation: ['getAvailability', 'setBlocked', 'setOutOfService'],
      },
    },
    description: 'Start date (YYYY-MM-DD)',
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
        resource: ['room'],
        operation: ['getAvailability', 'setBlocked', 'setOutOfService'],
      },
    },
    description: 'End date (YYYY-MM-DD)',
    placeholder: '2024-01-07',
  },
  {
    displayName: 'Status',
    name: 'status',
    type: 'options',
    options: [
      { name: 'Clean', value: 'clean' },
      { name: 'Dirty', value: 'dirty' },
      { name: 'Inspected', value: 'inspected' },
    ],
    default: 'clean',
    required: true,
    displayOptions: {
      show: {
        resource: ['room'],
        operation: ['updateHousekeeping'],
      },
    },
    description: 'The housekeeping status',
  },
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    displayOptions: {
      show: {
        resource: ['room'],
        operation: ['getAll'],
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
        resource: ['room'],
        operation: ['getAll'],
        returnAll: [false],
      },
    },
    description: 'Max number of results to return',
  },
  {
    displayName: 'Additional Options',
    name: 'additionalOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        resource: ['room'],
        operation: ['getAll', 'getAvailability'],
      },
    },
    options: [
      {
        displayName: 'Room Type ID',
        name: 'roomTypeID',
        type: 'string',
        default: '',
        description: 'Filter by room type',
      },
    ],
  },
  {
    displayName: 'Block Options',
    name: 'blockOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        resource: ['room'],
        operation: ['setBlocked', 'setOutOfService'],
      },
    },
    options: [
      {
        displayName: 'Reason',
        name: 'reason',
        type: 'string',
        default: '',
        description: 'Reason for blocking the room',
      },
      {
        displayName: 'Notes',
        name: 'notes',
        type: 'string',
        default: '',
        description: 'Additional notes',
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
      let response;

      switch (operation) {
        case 'getAll': {
          const propertyID = this.getNodeParameter('propertyID', i) as string;
          const returnAll = this.getNodeParameter('returnAll', i) as boolean;
          const additionalOptions = this.getNodeParameter('additionalOptions', i) as Record<
            string,
            unknown
          >;

          const query = {
            propertyID,
            ...additionalOptions,
          };

          if (returnAll) {
            const data = await cloudbedsApiRequestAllItems.call(
              this,
              'GET',
              '/getRooms',
              undefined,
              query,
            );
            response = { data };
          } else {
            const limit = this.getNodeParameter('limit', i) as number;
            response = await cloudbedsApiRequest.call(this, 'GET', '/getRooms', undefined, {
              ...query,
              pageSize: limit,
            });
          }
          break;
        }

        case 'getAvailability': {
          const propertyID = this.getNodeParameter('propertyID', i) as string;
          const startDate = this.getNodeParameter('startDate', i) as string;
          const endDate = this.getNodeParameter('endDate', i) as string;
          const additionalOptions = this.getNodeParameter('additionalOptions', i) as Record<
            string,
            unknown
          >;

          response = await cloudbedsApiRequest.call(this, 'GET', '/getAvailableRoomTypes', undefined, {
            propertyID,
            startDate,
            endDate,
            ...additionalOptions,
          });
          break;
        }

        case 'assignRoom': {
          const roomID = this.getNodeParameter('roomID', i) as string;
          const reservationID = this.getNodeParameter('reservationID', i) as string;

          response = await cloudbedsApiRequest.call(this, 'POST', '/postRoomAssign', {
            roomID,
            reservationID,
          });
          break;
        }

        case 'unassignRoom': {
          const roomID = this.getNodeParameter('roomID', i) as string;
          const reservationID = this.getNodeParameter('reservationID', i) as string;

          response = await cloudbedsApiRequest.call(this, 'POST', '/postRoomUnassign', {
            roomID,
            reservationID,
          });
          break;
        }

        case 'setBlocked': {
          const propertyID = this.getNodeParameter('propertyID', i) as string;
          const roomID = this.getNodeParameter('roomID', i) as string;
          const startDate = this.getNodeParameter('startDate', i) as string;
          const endDate = this.getNodeParameter('endDate', i) as string;
          const blockOptions = this.getNodeParameter('blockOptions', i) as Record<string, unknown>;

          response = await cloudbedsApiRequest.call(this, 'POST', '/postRoomBlock', {
            propertyID,
            roomID,
            startDate,
            endDate,
            ...blockOptions,
          });
          break;
        }

        case 'removeBlocked': {
          const propertyID = this.getNodeParameter('propertyID', i) as string;
          const roomID = this.getNodeParameter('roomID', i) as string;

          response = await cloudbedsApiRequest.call(this, 'DELETE', '/deleteRoomBlock', {
            propertyID,
            roomID,
          });
          break;
        }

        case 'setOutOfService': {
          const propertyID = this.getNodeParameter('propertyID', i) as string;
          const roomID = this.getNodeParameter('roomID', i) as string;
          const startDate = this.getNodeParameter('startDate', i) as string;
          const endDate = this.getNodeParameter('endDate', i) as string;
          const blockOptions = this.getNodeParameter('blockOptions', i) as Record<string, unknown>;

          response = await cloudbedsApiRequest.call(this, 'POST', '/postRoomOutOfService', {
            propertyID,
            roomID,
            startDate,
            endDate,
            ...blockOptions,
          });
          break;
        }

        case 'getHousekeeping': {
          const propertyID = this.getNodeParameter('propertyID', i) as string;

          response = await cloudbedsApiRequest.call(
            this,
            'GET',
            '/getHousekeepingStatus',
            undefined,
            {
              propertyID,
            },
          );
          break;
        }

        case 'updateHousekeeping': {
          const roomID = this.getNodeParameter('roomID', i) as string;
          const status = this.getNodeParameter('status', i) as string;

          response = await cloudbedsApiRequest.call(this, 'PUT', '/putHousekeepingStatus', {
            roomID,
            status,
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
