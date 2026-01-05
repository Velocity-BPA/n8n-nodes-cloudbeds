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
        resource: ['property'],
      },
    },
    options: [
      {
        name: 'Get Hotels',
        value: 'getHotels',
        description: 'Get all properties/hotels',
        action: 'Get all hotels',
      },
      {
        name: 'Get Hotel Details',
        value: 'getHotelDetails',
        description: 'Get details of a specific property',
        action: 'Get hotel details',
      },
      {
        name: 'Get Room Types',
        value: 'getRoomTypes',
        description: 'Get room types for a property',
        action: 'Get room types',
      },
      {
        name: 'Get Rooms',
        value: 'getRooms',
        description: 'Get individual rooms for a property',
        action: 'Get rooms',
      },
      {
        name: 'Get Rate Plans',
        value: 'getRatePlans',
        description: 'Get rate plans for a property',
        action: 'Get rate plans',
      },
      {
        name: 'Get Amenities',
        value: 'getAmenities',
        description: 'Get amenities for a property',
        action: 'Get amenities',
      },
    ],
    default: 'getHotels',
  },
  {
    displayName: 'Property ID',
    name: 'propertyID',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['property'],
        operation: ['getHotelDetails', 'getRoomTypes', 'getRooms', 'getRatePlans', 'getAmenities'],
      },
    },
    description: 'The ID of the property',
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
        case 'getHotels':
          response = await cloudbedsApiRequest.call(this, 'GET', '/getHotels');
          break;

        case 'getHotelDetails': {
          const propertyID = this.getNodeParameter('propertyID', i) as string;
          response = await cloudbedsApiRequest.call(this, 'GET', '/getHotelDetails', undefined, {
            propertyID,
          });
          break;
        }

        case 'getRoomTypes': {
          const propertyID = this.getNodeParameter('propertyID', i) as string;
          response = await cloudbedsApiRequest.call(this, 'GET', '/getRoomTypes', undefined, {
            propertyID,
          });
          break;
        }

        case 'getRooms': {
          const propertyID = this.getNodeParameter('propertyID', i) as string;
          response = await cloudbedsApiRequest.call(this, 'GET', '/getRooms', undefined, {
            propertyID,
          });
          break;
        }

        case 'getRatePlans': {
          const propertyID = this.getNodeParameter('propertyID', i) as string;
          response = await cloudbedsApiRequest.call(this, 'GET', '/getRatePlans', undefined, {
            propertyID,
          });
          break;
        }

        case 'getAmenities': {
          const propertyID = this.getNodeParameter('propertyID', i) as string;
          response = await cloudbedsApiRequest.call(this, 'GET', '/getAmenities', undefined, {
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
