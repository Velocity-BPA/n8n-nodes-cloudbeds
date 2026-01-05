/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { cloudbedsApiRequest, cloudbedsApiRequestAllItems } from '../../transport/CloudbedsClient';
import { HOUSEKEEPING_STATUSES } from '../../utils/helpers';

export const description: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['housekeeping'],
      },
    },
    options: [
      {
        name: 'Get Status',
        value: 'getStatus',
        description: 'Get all room housekeeping statuses',
        action: 'Get housekeeping status',
      },
      {
        name: 'Update Status',
        value: 'updateStatus',
        description: 'Update room housekeeping status',
        action: 'Update housekeeping status',
      },
      {
        name: 'Get Assignments',
        value: 'getAssignments',
        description: 'Get housekeeping assignments',
        action: 'Get assignments',
      },
      {
        name: 'Create Assignment',
        value: 'createAssignment',
        description: 'Create housekeeping assignment',
        action: 'Create assignment',
      },
    ],
    default: 'getStatus',
  },
  {
    displayName: 'Property ID',
    name: 'propertyID',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['housekeeping'],
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
        resource: ['housekeeping'],
        operation: ['updateStatus', 'createAssignment'],
      },
    },
    description: 'The ID of the room',
  },
  {
    displayName: 'Status',
    name: 'status',
    type: 'options',
    options: HOUSEKEEPING_STATUSES,
    default: 'clean',
    required: true,
    displayOptions: {
      show: {
        resource: ['housekeeping'],
        operation: ['updateStatus'],
      },
    },
    description: 'The housekeeping status',
  },
  {
    displayName: 'Staff Member ID',
    name: 'assignedTo',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['housekeeping'],
        operation: ['createAssignment'],
      },
    },
    description: 'The ID of the staff member to assign',
  },
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    displayOptions: {
      show: {
        resource: ['housekeeping'],
        operation: ['getStatus', 'getAssignments'],
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
        resource: ['housekeeping'],
        operation: ['getStatus', 'getAssignments'],
        returnAll: [false],
      },
    },
    description: 'Max number of results to return',
  },
  {
    displayName: 'Filters',
    name: 'filters',
    type: 'collection',
    placeholder: 'Add Filter',
    default: {},
    displayOptions: {
      show: {
        resource: ['housekeeping'],
        operation: ['getStatus'],
      },
    },
    options: [
      {
        displayName: 'Status',
        name: 'status',
        type: 'options',
        options: HOUSEKEEPING_STATUSES,
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
        displayName: 'Floor',
        name: 'floor',
        type: 'string',
        default: '',
        description: 'Filter by floor',
      },
    ],
  },
  {
    displayName: 'Assignment Options',
    name: 'assignmentOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        resource: ['housekeeping'],
        operation: ['createAssignment'],
      },
    },
    options: [
      {
        displayName: 'Priority',
        name: 'priority',
        type: 'options',
        options: [
          { name: 'Low', value: 'low' },
          { name: 'Normal', value: 'normal' },
          { name: 'High', value: 'high' },
          { name: 'Urgent', value: 'urgent' },
        ],
        default: 'normal',
        description: 'Assignment priority',
      },
      {
        displayName: 'Notes',
        name: 'notes',
        type: 'string',
        default: '',
        description: 'Assignment notes',
      },
      {
        displayName: 'Due Date',
        name: 'dueDate',
        type: 'string',
        default: '',
        placeholder: '2024-01-15',
        description: 'Due date (YYYY-MM-DD)',
      },
    ],
  },
  {
    displayName: 'Update Options',
    name: 'updateOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        resource: ['housekeeping'],
        operation: ['updateStatus'],
      },
    },
    options: [
      {
        displayName: 'Inspected By',
        name: 'inspectedBy',
        type: 'string',
        default: '',
        description: 'ID of staff member who inspected',
      },
      {
        displayName: 'Notes',
        name: 'notes',
        type: 'string',
        default: '',
        description: 'Status update notes',
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
        case 'getStatus': {
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
              '/getHousekeepingStatus',
              undefined,
              query,
            );
            response = { data };
          } else {
            const limit = this.getNodeParameter('limit', i) as number;
            response = await cloudbedsApiRequest.call(
              this,
              'GET',
              '/getHousekeepingStatus',
              undefined,
              {
                ...query,
                pageSize: limit,
              },
            );
          }
          break;
        }

        case 'updateStatus': {
          const roomID = this.getNodeParameter('roomID', i) as string;
          const status = this.getNodeParameter('status', i) as string;
          const updateOptions = this.getNodeParameter('updateOptions', i) as Record<
            string,
            unknown
          >;

          response = await cloudbedsApiRequest.call(this, 'PUT', '/putHousekeepingStatus', {
            propertyID,
            roomID,
            status,
            ...updateOptions,
          });
          break;
        }

        case 'getAssignments': {
          const returnAll = this.getNodeParameter('returnAll', i) as boolean;

          if (returnAll) {
            const data = await cloudbedsApiRequestAllItems.call(
              this,
              'GET',
              '/getHousekeepingAssignments',
              undefined,
              { propertyID },
            );
            response = { data };
          } else {
            const limit = this.getNodeParameter('limit', i) as number;
            response = await cloudbedsApiRequest.call(
              this,
              'GET',
              '/getHousekeepingAssignments',
              undefined,
              {
                propertyID,
                pageSize: limit,
              },
            );
          }
          break;
        }

        case 'createAssignment': {
          const roomID = this.getNodeParameter('roomID', i) as string;
          const assignedTo = this.getNodeParameter('assignedTo', i) as string;
          const assignmentOptions = this.getNodeParameter('assignmentOptions', i) as Record<
            string,
            unknown
          >;

          response = await cloudbedsApiRequest.call(this, 'POST', '/postHousekeepingAssignment', {
            propertyID,
            roomID,
            assignedTo,
            ...assignmentOptions,
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
