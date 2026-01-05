/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { IExecuteFunctions, INodeExecutionData, INodeProperties, IDataObject } from 'n8n-workflow';
import { cloudbedsApiRequest, cloudbedsApiRequestAllItems } from '../../transport/CloudbedsClient';
import { PAYMENT_METHODS, TRANSACTION_TYPES } from '../../utils/helpers';

export const description: INodeProperties[] = [
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    displayOptions: {
      show: {
        resource: ['transaction'],
      },
    },
    options: [
      {
        name: 'Get Many',
        value: 'getAll',
        description: 'Get all transactions',
        action: 'Get all transactions',
      },
      {
        name: 'Add Payment',
        value: 'addPayment',
        description: 'Add a payment',
        action: 'Add payment',
      },
      {
        name: 'Add Charge',
        value: 'addCharge',
        description: 'Add a charge',
        action: 'Add charge',
      },
      {
        name: 'Void Transaction',
        value: 'voidTransaction',
        description: 'Void a transaction',
        action: 'Void transaction',
      },
      {
        name: 'Get Invoice',
        value: 'getInvoice',
        description: 'Get invoice for a reservation',
        action: 'Get invoice',
      },
      {
        name: 'Email Invoice',
        value: 'emailInvoice',
        description: 'Send invoice via email',
        action: 'Email invoice',
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
        resource: ['transaction'],
        operation: ['getAll', 'addPayment', 'addCharge', 'getInvoice', 'emailInvoice'],
      },
    },
    description: 'The ID of the reservation',
  },
  {
    displayName: 'Transaction ID',
    name: 'transactionID',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['transaction'],
        operation: ['voidTransaction'],
      },
    },
    description: 'The ID of the transaction to void',
  },
  {
    displayName: 'Amount',
    name: 'amount',
    type: 'number',
    default: 0,
    typeOptions: {
      numberPrecision: 2,
      minValue: 0,
    },
    required: true,
    displayOptions: {
      show: {
        resource: ['transaction'],
        operation: ['addPayment', 'addCharge'],
      },
    },
    description: 'Transaction amount',
  },
  {
    displayName: 'Payment Method',
    name: 'paymentMethod',
    type: 'options',
    options: PAYMENT_METHODS,
    default: 'credit_card',
    required: true,
    displayOptions: {
      show: {
        resource: ['transaction'],
        operation: ['addPayment'],
      },
    },
    description: 'Payment method',
  },
  {
    displayName: 'Description',
    name: 'description',
    type: 'string',
    default: '',
    required: true,
    displayOptions: {
      show: {
        resource: ['transaction'],
        operation: ['addCharge'],
      },
    },
    description: 'Description of the charge',
  },
  {
    displayName: 'Email Address',
    name: 'email',
    type: 'string',
    default: '',
    displayOptions: {
      show: {
        resource: ['transaction'],
        operation: ['emailInvoice'],
      },
    },
    description: 'Email address to send invoice to (uses guest email if not specified)',
  },
  {
    displayName: 'Return All',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    displayOptions: {
      show: {
        resource: ['transaction'],
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
        resource: ['transaction'],
        operation: ['getAll'],
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
        resource: ['transaction'],
        operation: ['getAll'],
      },
    },
    options: [
      {
        displayName: 'Type',
        name: 'type',
        type: 'options',
        options: TRANSACTION_TYPES,
        default: '',
        description: 'Filter by transaction type',
      },
      {
        displayName: 'Start Date',
        name: 'startDate',
        type: 'string',
        default: '',
        placeholder: '2024-01-01',
        description: 'Filter by start date',
      },
      {
        displayName: 'End Date',
        name: 'endDate',
        type: 'string',
        default: '',
        placeholder: '2024-01-31',
        description: 'Filter by end date',
      },
    ],
  },
  {
    displayName: 'Payment Options',
    name: 'paymentOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        resource: ['transaction'],
        operation: ['addPayment'],
      },
    },
    options: [
      {
        displayName: 'Reference Number',
        name: 'referenceNumber',
        type: 'string',
        default: '',
        description: 'External reference number',
      },
      {
        displayName: 'Notes',
        name: 'notes',
        type: 'string',
        default: '',
        description: 'Payment notes',
      },
    ],
  },
  {
    displayName: 'Charge Options',
    name: 'chargeOptions',
    type: 'collection',
    placeholder: 'Add Option',
    default: {},
    displayOptions: {
      show: {
        resource: ['transaction'],
        operation: ['addCharge'],
      },
    },
    options: [
      {
        displayName: 'Category',
        name: 'category',
        type: 'string',
        default: '',
        description: 'Charge category',
      },
      {
        displayName: 'Quantity',
        name: 'quantity',
        type: 'number',
        default: 1,
        description: 'Quantity',
      },
      {
        displayName: 'Tax Included',
        name: 'taxIncluded',
        type: 'boolean',
        default: false,
        description: 'Whether tax is included in the amount',
      },
      {
        displayName: 'Notes',
        name: 'notes',
        type: 'string',
        default: '',
        description: 'Charge notes',
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
          const reservationID = this.getNodeParameter('reservationID', i) as string;
          const returnAll = this.getNodeParameter('returnAll', i) as boolean;
          const filters = this.getNodeParameter('filters', i) as Record<string, unknown>;

          const query = {
            reservationID,
            ...filters,
          };

          if (returnAll) {
            const data = await cloudbedsApiRequestAllItems.call(
              this,
              'GET',
              '/getTransactions',
              undefined,
              query,
            );
            response = { data };
          } else {
            const limit = this.getNodeParameter('limit', i) as number;
            response = await cloudbedsApiRequest.call(this, 'GET', '/getTransactions', undefined, {
              ...query,
              pageSize: limit,
            });
          }
          break;
        }

        case 'addPayment': {
          const reservationID = this.getNodeParameter('reservationID', i) as string;
          const amount = this.getNodeParameter('amount', i) as number;
          const paymentMethod = this.getNodeParameter('paymentMethod', i) as string;
          const paymentOptions = this.getNodeParameter('paymentOptions', i) as Record<
            string,
            unknown
          >;

          response = await cloudbedsApiRequest.call(this, 'POST', '/postPayment', {
            reservationID,
            amount,
            paymentMethod,
            ...paymentOptions,
          });
          break;
        }

        case 'addCharge': {
          const reservationID = this.getNodeParameter('reservationID', i) as string;
          const amount = this.getNodeParameter('amount', i) as number;
          const description = this.getNodeParameter('description', i) as string;
          const chargeOptions = this.getNodeParameter('chargeOptions', i) as Record<
            string,
            unknown
          >;

          response = await cloudbedsApiRequest.call(this, 'POST', '/postCharge', {
            reservationID,
            amount,
            description,
            ...chargeOptions,
          });
          break;
        }

        case 'voidTransaction': {
          const transactionID = this.getNodeParameter('transactionID', i) as string;

          response = await cloudbedsApiRequest.call(this, 'POST', '/postVoidTransaction', {
            transactionID,
          });
          break;
        }

        case 'getInvoice': {
          const reservationID = this.getNodeParameter('reservationID', i) as string;

          response = await cloudbedsApiRequest.call(this, 'GET', '/getInvoice', undefined, {
            reservationID,
          });
          break;
        }

        case 'emailInvoice': {
          const reservationID = this.getNodeParameter('reservationID', i) as string;
          const email = this.getNodeParameter('email', i, '') as string;

          response = await cloudbedsApiRequest.call(this, 'POST', '/postEmailInvoice', {
            reservationID,
            email: email || undefined,
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
