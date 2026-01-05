/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { cloudbedsApiRequest, cloudbedsApiRequestAllItems } from '../../transport/CloudbedsClient';
import { RESERVATION_STATUSES } from '../../utils/helpers';

export const description: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['reservation'],
      },
    },
    options: [
      {
        name: 'Create',
        value: 'create',
        description: 'Create a new reservation',
        action: 'Create a reservation',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get a reservation by ID',
        action: 'Get a reservation',
      },
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Get many reservations',
        action: 'Get many reservations',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update a reservation',
        action: 'Update a reservation',
      },
      {
        name: 'Cancel',
        value: 'cancel',
        description: 'Cancel a reservation',
        action: 'Cancel a reservation',
      },
      {
        name: 'Get By Dates',
        value: 'getByDates',
        description: 'Get reservations by date range',
        action: 'Get reservations by dates',
      },
      {
        name: 'Get By Status',
        value: 'getByStatus',
        description: 'Get reservations by status',
        action: 'Get reservations by status',
      },
      {
        name: 'Add Note',
        value: 'addNote',
        description: 'Add a note to a reservation',
        action: 'Add note to reservation',
      },
    ],
    default: 'getAll',
  },
  {
    displayName: 'Reservation ID',
    name: 'reservationID',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['reservation'],
        operation: ['get', 'update', 'cancel', 'addNote'],
      },
    },
    description: 'The ID of the reservation',
  },
  {
    displayName: 'Property ID',
    name: 'propertyID',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['reservation'],
        operation: ['create', 'getAll', 'getByDates', 'getByStatus'],
      },
    },
    description: 'The ID of the property',
  },
  {
    displayName: 'Start Date',
    name: 'startDate',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['reservation'],
        operation: ['create', 'getByDates'],
      },
    },
    description: 'Start date in YYYY-MM-DD format',
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
        resource: ['reservation'],
        operation: ['create', 'getByDates'],
      },
    },
    description: 'End date in YYYY-MM-DD format',
    placeholder: '2024-01-07',
  },
  {
    displayName: 'Room Type ID',
    name: 'roomTypeID',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['reservation'],
        operation: ['create'],
      },
    },
    description: 'The ID of the room type',
  },
  {
    displayName: 'Guest First Name',
    name: 'guestFirstName',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['reservation'],
        operation: ['create'],
      },
    },
    description: 'First name of the guest',
  },
  {
    displayName: 'Guest Last Name',
    name: 'guestLastName',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['reservation'],
        operation: ['create'],
      },
    },
    description: 'Last name of the guest',
  },
  {
    displayName: 'Status',
    name: 'status',
    type: 'options',
    options: RESERVATION_STATUSES,
    default: 'confirmed',
    required: true,
    displayOptions: {
      show: {
        resource: ['reservation'],
        operation: ['getByStatus'],
      },
    },
    description: 'The status to filter by',
  },
  {
    displayName: 'Note',
    name: 'note',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['reservation'],
        operation: ['addNote'],
      },
    },
    description: 'The note text to add',
  },
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    displayOptions: {
      show: {
        resource: ['reservation'],
        operation: ['getAll', 'getByDates', 'getByStatus'],
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
        resource: ['reservation'],
        operation: ['getAll', 'getByDates', 'getByStatus'],
        returnAll: [false],
      },
    },
    description: 'Max number of results to return',
  },
  {
    displayName: 'Additional Fields',
    name: 'additionalFields',
    type: 'collection',
    placeholder: 'Add Field',
    default: {},
    displayOptions: {
      show: {
        resource: ['reservation'],
        operation: ['create', 'update'],
      },
    },
    options: [
      {
        displayName: 'Guest Email',
        name: 'guestEmail',
        type: 'string',
        default: '',
        description: 'Email address of the guest',
      },
      {
        displayName: 'Guest Phone',
        name: 'guestPhone',
        type: 'string',
        default: '',
        description: 'Phone number of the guest',
      },
      {
        displayName: 'Adults',
        name: 'adults',
        type: 'number',
        default: 1,
        description: 'Number of adults',
      },
      {
        displayName: 'Children',
        name: 'children',
        type: 'number',
        default: 0,
        description: 'Number of children',
      },
      {
        displayName: 'Rate Plan ID',
        name: 'ratePlanID',
        type: 'string',
        default: '',
        description: 'The rate plan to use',
      },
      {
        displayName: 'Source ID',
        name: 'sourceID',
        type: 'string',
        default: '',
        description: 'The booking source',
      },
      {
        displayName: 'Notes',
        name: 'notes',
        type: 'string',
        default: '',
        description: 'Reservation notes',
      },
      {
        displayName: 'Estimated Arrival Time',
        name: 'estimatedArrivalTime',
        type: 'string',
        default: '',
        placeholder: '14:00',
        description: 'Expected arrival time (HH:MM)',
      },
    ],
  },
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: {
      show: {
        resource: ['reservation'],
        operation: ['getAll'],
      },
    },
    options: [
      {
        displayName: 'Status',
        name: 'status',
        type: 'options',
        options: RESERVATION_STATUSES,
        default: '',
        description: 'Filter by status',
      },
      {
        displayName: 'Room Type ID',
        name: 'roomTypeID',
        type: 'string',
        default: '',
        description: 'Filter by room type',
      },
      {
        displayName: 'Source ID',
        name: 'sourceID',
        type: 'string',
        default: '',
        description: 'Filter by booking source',
      },
      {
        displayName: 'Modified Since',
        name: 'modifiedSince',
        type: 'string',
        default: '',
        placeholder: '2024-01-01',
        description: 'Only return reservations modified after this date',
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
        case 'create': {
          const propertyID = this.getNodeParameter('propertyID', i) as string;
          const startDate = this.getNodeParameter('startDate', i) as string;
          const endDate = this.getNodeParameter('endDate', i) as string;
          const roomTypeID = this.getNodeParameter('roomTypeID', i) as string;
          const guestFirstName = this.getNodeParameter('guestFirstName', i) as string;
          const guestLastName = this.getNodeParameter('guestLastName', i) as string;
          const additionalFields = this.getNodeParameter('additionalFields', i) as Record<
            string,
            unknown
          >;

          const body = {
            propertyID,
            startDate,
            endDate,
            roomTypeID,
            guestFirstName,
            guestLastName,
            ...additionalFields,
          };

          response = await cloudbedsApiRequest.call(this, 'POST', '/postReservation', body);
          break;
        }

        case 'get': {
          const reservationID = this.getNodeParameter('reservationID', i) as string;
          response = await cloudbedsApiRequest.call(this, 'GET', '/getReservation', undefined, {
            reservationID,
          });
          break;
        }

        case 'getAll': {
          const propertyID = this.getNodeParameter('propertyID', i) as string;
          const returnAll = this.getNodeParameter('returnAll', i) as boolean;
          const filters = this.getNodeParameter('filters', i) as Record<string, unknown>;

          const query = {
            propertyID,
            ...filters,
          };

          if (returnAll) {
            const data = await cloudbedsApiRequestAllItems.call(
              this,
              'GET',
              '/getReservations',
              undefined,
              query,
            );
            response = { data };
          } else {
            const limit = this.getNodeParameter('limit', i) as number;
            response = await cloudbedsApiRequest.call(this, 'GET', '/getReservations', undefined, {
              ...query,
              pageSize: limit,
            });
          }
          break;
        }

        case 'update': {
          const reservationID = this.getNodeParameter('reservationID', i) as string;
          const additionalFields = this.getNodeParameter('additionalFields', i) as Record<
            string,
            unknown
          >;

          const body = {
            reservationID,
            ...additionalFields,
          };

          response = await cloudbedsApiRequest.call(this, 'PUT', '/putReservation', body);
          break;
        }

        case 'cancel': {
          const reservationID = this.getNodeParameter('reservationID', i) as string;
          response = await cloudbedsApiRequest.call(this, 'PUT', '/putReservation', {
            reservationID,
            status: 'canceled',
          });
          break;
        }

        case 'getByDates': {
          const propertyID = this.getNodeParameter('propertyID', i) as string;
          const startDate = this.getNodeParameter('startDate', i) as string;
          const endDate = this.getNodeParameter('endDate', i) as string;
          const returnAll = this.getNodeParameter('returnAll', i) as boolean;

          const query = {
            propertyID,
            startDate,
            endDate,
          };

          if (returnAll) {
            const data = await cloudbedsApiRequestAllItems.call(
              this,
              'GET',
              '/getReservationsByDate',
              undefined,
              query,
            );
            response = { data };
          } else {
            const limit = this.getNodeParameter('limit', i) as number;
            response = await cloudbedsApiRequest.call(
              this,
              'GET',
              '/getReservationsByDate',
              undefined,
              {
                ...query,
                pageSize: limit,
              },
            );
          }
          break;
        }

        case 'getByStatus': {
          const propertyID = this.getNodeParameter('propertyID', i) as string;
          const status = this.getNodeParameter('status', i) as string;
          const returnAll = this.getNodeParameter('returnAll', i) as boolean;

          const query = {
            propertyID,
            status,
          };

          if (returnAll) {
            const data = await cloudbedsApiRequestAllItems.call(
              this,
              'GET',
              '/getReservations',
              undefined,
              query,
            );
            response = { data };
          } else {
            const limit = this.getNodeParameter('limit', i) as number;
            response = await cloudbedsApiRequest.call(this, 'GET', '/getReservations', undefined, {
              ...query,
              pageSize: limit,
            });
          }
          break;
        }

        case 'addNote': {
          const reservationID = this.getNodeParameter('reservationID', i) as string;
          const note = this.getNodeParameter('note', i) as string;

          response = await cloudbedsApiRequest.call(this, 'POST', '/postReservationNote', {
            reservationID,
            note,
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
