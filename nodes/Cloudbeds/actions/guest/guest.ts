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
        resource: ['guest'],
      },
    },
    options: [
      {
        name: 'Create',
        value: 'create',
        description: 'Create a new guest',
        action: 'Create a guest',
      },
      {
        name: 'Get',
        value: 'get',
        description: 'Get a guest by ID',
        action: 'Get a guest',
      },
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Get many guests',
        action: 'Get many guests',
      },
      {
        name: 'Update',
        value: 'update',
        description: 'Update a guest',
        action: 'Update a guest',
      },
      {
        name: 'Search',
        value: 'search',
        description: 'Search for guests',
        action: 'Search for guests',
      },
      {
        name: 'Get By Reservation',
        value: 'getByReservation',
        description: 'Get guests for a reservation',
        action: 'Get reservation guests',
      },
    ],
    default: 'getAll',
  },
  {
    displayName: 'Guest ID',
    name: 'guestID',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['guest'],
        operation: ['get', 'update'],
      },
    },
    description: 'The ID of the guest',
  },
  {
    displayName: 'Property ID',
    name: 'propertyID',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['guest'],
        operation: ['create', 'getAll', 'search'],
      },
    },
    description: 'The ID of the property',
  },
  {
    displayName: 'Reservation ID',
    name: 'reservationID',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['guest'],
        operation: ['getByReservation'],
      },
    },
    description: 'The ID of the reservation',
  },
  {
    displayName: 'First Name',
    name: 'firstName',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['guest'],
        operation: ['create'],
      },
    },
    description: 'First name of the guest',
  },
  {
    displayName: 'Last Name',
    name: 'lastName',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['guest'],
        operation: ['create'],
      },
    },
    description: 'Last name of the guest',
  },
  {
    displayName: 'Search Query',
    name: 'searchQuery',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['guest'],
        operation: ['search'],
      },
    },
    description: 'Search query (name, email, or phone)',
  },
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    displayOptions: {
      show: {
        resource: ['guest'],
        operation: ['getAll', 'search'],
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
        resource: ['guest'],
        operation: ['getAll', 'search'],
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
        resource: ['guest'],
        operation: ['create', 'update'],
      },
    },
    options: [
      {
        displayName: 'Email',
        name: 'email',
        type: 'string',
        default: '',
        description: 'Email address of the guest',
      },
      {
        displayName: 'Phone',
        name: 'phone',
        type: 'string',
        default: '',
        description: 'Phone number of the guest',
      },
      {
        displayName: 'Address',
        name: 'address',
        type: 'string',
        default: '',
        description: 'Street address',
      },
      {
        displayName: 'City',
        name: 'city',
        type: 'string',
        default: '',
        description: 'City',
      },
      {
        displayName: 'State',
        name: 'state',
        type: 'string',
        default: '',
        description: 'State or province',
      },
      {
        displayName: 'Country',
        name: 'country',
        type: 'string',
        default: '',
        description: 'Country code (e.g., US, GB)',
      },
      {
        displayName: 'Zip Code',
        name: 'zip',
        type: 'string',
        default: '',
        description: 'Postal/ZIP code',
      },
      {
        displayName: 'Date of Birth',
        name: 'dateOfBirth',
        type: 'string',
        default: '',
        placeholder: '1990-01-15',
        description: 'Date of birth (YYYY-MM-DD)',
      },
      {
        displayName: 'Gender',
        name: 'gender',
        type: 'options',
        options: [
          { name: 'Male', value: 'male' },
          { name: 'Female', value: 'female' },
          { name: 'Other', value: 'other' },
        ],
        default: '',
        description: 'Gender',
      },
      {
        displayName: 'Nationality',
        name: 'nationality',
        type: 'string',
        default: '',
        description: 'Nationality',
      },
      {
        displayName: 'Document Type',
        name: 'documentType',
        type: 'options',
        options: [
          { name: 'Passport', value: 'passport' },
          { name: 'ID Card', value: 'id_card' },
          { name: 'Driver License', value: 'driver_license' },
        ],
        default: '',
        description: 'Type of identification document',
      },
      {
        displayName: 'Document Number',
        name: 'documentNumber',
        type: 'string',
        default: '',
        description: 'Identification document number',
      },
      {
        displayName: 'Company',
        name: 'company',
        type: 'string',
        default: '',
        description: 'Company name',
      },
      {
        displayName: 'Tax ID',
        name: 'taxID',
        type: 'string',
        default: '',
        description: 'Tax identification number',
      },
      {
        displayName: 'Notes',
        name: 'notes',
        type: 'string',
        default: '',
        description: 'Additional notes about the guest',
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
        resource: ['guest'],
        operation: ['getAll'],
      },
    },
    options: [
      {
        displayName: 'Email',
        name: 'email',
        type: 'string',
        default: '',
        description: 'Filter by email',
      },
      {
        displayName: 'First Name',
        name: 'firstName',
        type: 'string',
        default: '',
        description: 'Filter by first name',
      },
      {
        displayName: 'Last Name',
        name: 'lastName',
        type: 'string',
        default: '',
        description: 'Filter by last name',
      },
      {
        displayName: 'Phone',
        name: 'phone',
        type: 'string',
        default: '',
        description: 'Filter by phone',
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
          const firstName = this.getNodeParameter('firstName', i) as string;
          const lastName = this.getNodeParameter('lastName', i) as string;
          const additionalFields = this.getNodeParameter('additionalFields', i) as Record<
            string,
            unknown
          >;

          const body = {
            propertyID,
            firstName,
            lastName,
            ...additionalFields,
          };

          response = await cloudbedsApiRequest.call(this, 'POST', '/postGuest', body);
          break;
        }

        case 'get': {
          const guestID = this.getNodeParameter('guestID', i) as string;
          response = await cloudbedsApiRequest.call(this, 'GET', '/getGuest', undefined, {
            guestID,
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
              '/getGuests',
              undefined,
              query,
            );
            response = { data };
          } else {
            const limit = this.getNodeParameter('limit', i) as number;
            response = await cloudbedsApiRequest.call(this, 'GET', '/getGuests', undefined, {
              ...query,
              pageSize: limit,
            });
          }
          break;
        }

        case 'update': {
          const guestID = this.getNodeParameter('guestID', i) as string;
          const additionalFields = this.getNodeParameter('additionalFields', i) as Record<
            string,
            unknown
          >;

          const body = {
            guestID,
            ...additionalFields,
          };

          response = await cloudbedsApiRequest.call(this, 'PUT', '/putGuest', body);
          break;
        }

        case 'search': {
          const propertyID = this.getNodeParameter('propertyID', i) as string;
          const searchQuery = this.getNodeParameter('searchQuery', i) as string;
          const returnAll = this.getNodeParameter('returnAll', i) as boolean;

          const query = {
            propertyID,
            searchQuery,
          };

          if (returnAll) {
            const data = await cloudbedsApiRequestAllItems.call(
              this,
              'GET',
              '/getGuestSearch',
              undefined,
              query,
            );
            response = { data };
          } else {
            const limit = this.getNodeParameter('limit', i) as number;
            response = await cloudbedsApiRequest.call(this, 'GET', '/getGuestSearch', undefined, {
              ...query,
              pageSize: limit,
            });
          }
          break;
        }

        case 'getByReservation': {
          const reservationID = this.getNodeParameter('reservationID', i) as string;
          response = await cloudbedsApiRequest.call(
            this,
            'GET',
            '/getReservationGuests',
            undefined,
            {
              reservationID,
            },
          );
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
