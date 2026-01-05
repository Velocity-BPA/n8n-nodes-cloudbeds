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
        resource: ['report'],
      },
    },
    options: [
      {
        name: 'Get Occupancy',
        value: 'getOccupancy',
        description: 'Get occupancy report',
        action: 'Get occupancy report',
      },
      {
        name: 'Get Revenue',
        value: 'getRevenue',
        description: 'Get revenue report',
        action: 'Get revenue report',
      },
      {
        name: 'Get Arrivals/Departures',
        value: 'getArrivalsDepartures',
        description: 'Get arrivals and departures report',
        action: 'Get arrivals departures',
      },
      {
        name: 'Get Custom Report',
        value: 'getCustomReport',
        description: 'Get a custom report by ID',
        action: 'Get custom report',
      },
      {
        name: 'Get Saved Reports',
        value: 'getSavedReports',
        description: 'List all saved reports',
        action: 'Get saved reports',
      },
    ],
    default: 'getOccupancy',
  },
  {
    displayName: 'Property ID',
    name: 'propertyID',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['report'],
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
        resource: ['report'],
        operation: ['getOccupancy', 'getRevenue', 'getArrivalsDepartures'],
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
        resource: ['report'],
        operation: ['getOccupancy', 'getRevenue', 'getArrivalsDepartures'],
      },
    },
    description: 'End date (YYYY-MM-DD)',
    placeholder: '2024-01-31',
  },
  {
    displayName: 'Report ID',
    name: 'reportID',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['report'],
        operation: ['getCustomReport'],
      },
    },
    description: 'The ID of the custom report',
  },
  {
    displayName: 'Date',
    name: 'date',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['report'],
        operation: ['getArrivalsDepartures'],
      },
    },
    description: 'The specific date for arrivals/departures (YYYY-MM-DD)',
    placeholder: '2024-01-15',
  },
  {
    displayName: 'Report Options',
    name: 'reportOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        resource: ['report'],
        operation: ['getOccupancy', 'getRevenue'],
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
      {
        displayName: 'Group By',
        name: 'groupBy',
        type: 'options',
        options: [
          { name: 'Day', value: 'day' },
          { name: 'Week', value: 'week' },
          { name: 'Month', value: 'month' },
        ],
        default: 'day',
        description: 'Group results by time period',
      },
      {
        displayName: 'Include Details',
        name: 'includeDetails',
        type: 'boolean',
        default: false,
        description: 'Whether to include detailed breakdown',
      },
    ],
  },
  {
    displayName: 'Arrivals/Departures Options',
    name: 'arrivalsDeparturesOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        resource: ['report'],
        operation: ['getArrivalsDepartures'],
      },
    },
    options: [
      {
        displayName: 'Type',
        name: 'type',
        type: 'options',
        options: [
          { name: 'All', value: 'all' },
          { name: 'Arrivals Only', value: 'arrivals' },
          { name: 'Departures Only', value: 'departures' },
        ],
        default: 'all',
        description: 'Filter by arrivals or departures',
      },
      {
        displayName: 'Include Canceled',
        name: 'includeCanceled',
        type: 'boolean',
        default: false,
        description: 'Whether to include canceled reservations',
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
        case 'getOccupancy': {
          const startDate = this.getNodeParameter('startDate', i) as string;
          const endDate = this.getNodeParameter('endDate', i) as string;
          const reportOptions = this.getNodeParameter('reportOptions', i) as Record<
            string,
            unknown
          >;

          response = await cloudbedsApiRequest.call(this, 'GET', '/getOccupancyReport', undefined, {
            propertyID,
            startDate,
            endDate,
            ...reportOptions,
          });
          break;
        }

        case 'getRevenue': {
          const startDate = this.getNodeParameter('startDate', i) as string;
          const endDate = this.getNodeParameter('endDate', i) as string;
          const reportOptions = this.getNodeParameter('reportOptions', i) as Record<
            string,
            unknown
          >;

          response = await cloudbedsApiRequest.call(this, 'GET', '/getRevenueReport', undefined, {
            propertyID,
            startDate,
            endDate,
            ...reportOptions,
          });
          break;
        }

        case 'getArrivalsDepartures': {
          const date = this.getNodeParameter('date', i) as string;
          const arrivalsDeparturesOptions = this.getNodeParameter(
            'arrivalsDeparturesOptions',
            i,
          ) as Record<string, unknown>;

          response = await cloudbedsApiRequest.call(
            this,
            'GET',
            '/getArrivalsDepartures',
            undefined,
            {
              propertyID,
              date,
              ...arrivalsDeparturesOptions,
            },
          );
          break;
        }

        case 'getCustomReport': {
          const reportID = this.getNodeParameter('reportID', i) as string;

          response = await cloudbedsApiRequest.call(this, 'GET', '/getCustomReport', undefined, {
            propertyID,
            reportID,
          });
          break;
        }

        case 'getSavedReports': {
          response = await cloudbedsApiRequest.call(this, 'GET', '/getSavedReports', undefined, {
            propertyID,
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
