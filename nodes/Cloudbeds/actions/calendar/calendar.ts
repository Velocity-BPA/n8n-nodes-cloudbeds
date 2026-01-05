/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { cloudbedsApiRequest } from '../../transport/CloudbedsClient';

export const description: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['calendar'],
      },
    },
    options: [
      {
        name: 'Get Calendar',
        value: 'getCalendar',
        description: 'Get availability calendar',
        action: 'Get calendar',
      },
      {
        name: 'Update Calendar',
        value: 'updateCalendar',
        description: 'Update calendar availability',
        action: 'Update calendar',
      },
      {
        name: 'Get Rates',
        value: 'getRates',
        description: 'Get rates for date range',
        action: 'Get rates',
      },
      {
        name: 'Update Rates',
        value: 'updateRates',
        description: 'Update rates for date range',
        action: 'Update rates',
      },
      {
        name: 'Get Restrictions',
        value: 'getRestrictions',
        description: 'Get booking restrictions',
        action: 'Get restrictions',
      },
      {
        name: 'Update Restrictions',
        value: 'updateRestrictions',
        description: 'Update booking restrictions',
        action: 'Update restrictions',
      },
    ],
    default: 'getCalendar',
  },
  {
    displayName: 'Property ID',
    name: 'propertyID',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['calendar'],
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
        resource: ['calendar'],
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
        resource: ['calendar'],
      },
    },
    description: 'End date (YYYY-MM-DD)',
    placeholder: '2024-01-31',
  },
  {
    displayName: 'Room Type ID',
    name: 'roomTypeID',
    type: 'string',
    default: '',
    displayOptions: {
      show: {
        resource: ['calendar'],
        operation: [
          'getCalendar',
          'updateCalendar',
          'getRates',
          'updateRates',
          'getRestrictions',
          'updateRestrictions',
        ],
      },
    },
    description: 'Filter by room type (optional for get operations)',
  },
  {
    displayName: 'Rate Plan ID',
    name: 'ratePlanID',
    type: 'string',
    default: '',
    displayOptions: {
      show: {
        resource: ['calendar'],
        operation: ['getRates', 'updateRates', 'getRestrictions', 'updateRestrictions'],
      },
    },
    description: 'Filter by rate plan',
  },
  {
    displayName: 'Available Rooms',
    name: 'availableRooms',
    type: 'number',
    default: 0,
    displayOptions: {
      show: {
        resource: ['calendar'],
        operation: ['updateCalendar'],
      },
    },
    description: 'Number of available rooms',
  },
  {
    displayName: 'Rate',
    name: 'rate',
    type: 'number',
    default: 0,
    typeOptions: {
      numberPrecision: 2,
    },
    displayOptions: {
      show: {
        resource: ['calendar'],
        operation: ['updateRates'],
      },
    },
    description: 'Rate amount',
  },
  {
    displayName: 'Restriction Options',
    name: 'restrictionOptions',
    type: 'collection',
    placeholder: 'Add Restriction',
    default: {},
    displayOptions: {
      show: {
        resource: ['calendar'],
        operation: ['updateRestrictions'],
      },
    },
    options: [
      {
        displayName: 'Minimum Stay',
        name: 'minimumStay',
        type: 'number',
        default: 1,
        description: 'Minimum nights required',
      },
      {
        displayName: 'Maximum Stay',
        name: 'maximumStay',
        type: 'number',
        default: 0,
        description: 'Maximum nights allowed (0 = unlimited)',
      },
      {
        displayName: 'Closed to Arrival',
        name: 'closedToArrival',
        type: 'boolean',
        default: false,
        description: 'Whether arrivals are blocked on this date',
      },
      {
        displayName: 'Closed to Departure',
        name: 'closedToDeparture',
        type: 'boolean',
        default: false,
        description: 'Whether departures are blocked on this date',
      },
      {
        displayName: 'Stop Sell',
        name: 'stopSell',
        type: 'boolean',
        default: false,
        description: 'Whether to stop selling this room type',
      },
    ],
  },
  {
    displayName: 'Calendar Options',
    name: 'calendarOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        resource: ['calendar'],
        operation: ['getCalendar'],
      },
    },
    options: [
      {
        displayName: 'Include Rates',
        name: 'includeRates',
        type: 'boolean',
        default: false,
        description: 'Whether to include rate information',
      },
      {
        displayName: 'Include Restrictions',
        name: 'includeRestrictions',
        type: 'boolean',
        default: false,
        description: 'Whether to include restriction information',
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
      const startDate = this.getNodeParameter('startDate', i) as string;
      const endDate = this.getNodeParameter('endDate', i) as string;

      let response;

      switch (operation) {
        case 'getCalendar': {
          const roomTypeID = this.getNodeParameter('roomTypeID', i, '') as string;
          const calendarOptions = this.getNodeParameter('calendarOptions', i) as Record<
            string,
            unknown
          >;

          response = await cloudbedsApiRequest.call(this, 'GET', '/getCalendar', undefined, {
            propertyID,
            startDate,
            endDate,
            roomTypeID: roomTypeID || undefined,
            ...calendarOptions,
          });
          break;
        }

        case 'updateCalendar': {
          const roomTypeID = this.getNodeParameter('roomTypeID', i) as string;
          const availableRooms = this.getNodeParameter('availableRooms', i) as number;

          response = await cloudbedsApiRequest.call(this, 'PUT', '/putCalendar', {
            propertyID,
            startDate,
            endDate,
            roomTypeID,
            availableRooms,
          });
          break;
        }

        case 'getRates': {
          const roomTypeID = this.getNodeParameter('roomTypeID', i, '') as string;
          const ratePlanID = this.getNodeParameter('ratePlanID', i, '') as string;

          response = await cloudbedsApiRequest.call(this, 'GET', '/getRates', undefined, {
            propertyID,
            startDate,
            endDate,
            roomTypeID: roomTypeID || undefined,
            ratePlanID: ratePlanID || undefined,
          });
          break;
        }

        case 'updateRates': {
          const roomTypeID = this.getNodeParameter('roomTypeID', i) as string;
          const ratePlanID = this.getNodeParameter('ratePlanID', i) as string;
          const rate = this.getNodeParameter('rate', i) as number;

          response = await cloudbedsApiRequest.call(this, 'PUT', '/putRates', {
            propertyID,
            startDate,
            endDate,
            roomTypeID,
            ratePlanID,
            rate,
          });
          break;
        }

        case 'getRestrictions': {
          const roomTypeID = this.getNodeParameter('roomTypeID', i, '') as string;
          const ratePlanID = this.getNodeParameter('ratePlanID', i, '') as string;

          response = await cloudbedsApiRequest.call(this, 'GET', '/getRestrictions', undefined, {
            propertyID,
            startDate,
            endDate,
            roomTypeID: roomTypeID || undefined,
            ratePlanID: ratePlanID || undefined,
          });
          break;
        }

        case 'updateRestrictions': {
          const roomTypeID = this.getNodeParameter('roomTypeID', i) as string;
          const ratePlanID = this.getNodeParameter('ratePlanID', i, '') as string;
          const restrictionOptions = this.getNodeParameter('restrictionOptions', i) as Record<
            string,
            unknown
          >;

          response = await cloudbedsApiRequest.call(this, 'PUT', '/putRestrictions', {
            propertyID,
            startDate,
            endDate,
            roomTypeID,
            ratePlanID: ratePlanID || undefined,
            ...restrictionOptions,
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
