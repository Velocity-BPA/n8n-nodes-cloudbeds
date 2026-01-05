/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';

import * as property from './actions/property/property';
import * as reservation from './actions/reservation/reservation';
import * as guest from './actions/guest/guest';
import * as room from './actions/room/room';
import * as calendar from './actions/calendar/calendar';
import * as transaction from './actions/transaction/transaction';
import * as housekeeping from './actions/housekeeping/housekeeping';
import * as report from './actions/report/report';
import * as channel from './actions/channel/channel';

// Licensing notice - logged once per node load
const LICENSING_NOTICE = `[Velocity BPA Licensing Notice]

This n8n node is licensed under the Business Source License 1.1 (BSL 1.1).

Use of this node by for-profit organizations in production environments requires a commercial license from Velocity BPA.

For licensing information, visit https://velobpa.com/licensing or contact licensing@velobpa.com.`;

let licensingNoticeLogged = false;

export class Cloudbeds implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Cloudbeds',
    name: 'cloudbeds',
    icon: 'file:cloudbeds.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description:
      'Interact with Cloudbeds hospitality PMS - manage properties, reservations, guests, rooms, and more',
    defaults: {
      name: 'Cloudbeds',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'cloudbedsApi',
        required: true,
      },
    ],
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Property',
            value: 'property',
            description: 'Manage properties and hotels',
          },
          {
            name: 'Reservation',
            value: 'reservation',
            description: 'Manage reservations',
          },
          {
            name: 'Guest',
            value: 'guest',
            description: 'Manage guests',
          },
          {
            name: 'Room',
            value: 'room',
            description: 'Manage rooms and availability',
          },
          {
            name: 'Calendar',
            value: 'calendar',
            description: 'Manage availability calendar and rates',
          },
          {
            name: 'Transaction',
            value: 'transaction',
            description: 'Manage payments and charges',
          },
          {
            name: 'Housekeeping',
            value: 'housekeeping',
            description: 'Manage housekeeping status and assignments',
          },
          {
            name: 'Report',
            value: 'report',
            description: 'Generate reports',
          },
          {
            name: 'Channel',
            value: 'channel',
            description: 'Manage channel connections and sync',
          },
        ],
        default: 'reservation',
      },
      // Property operations
      ...property.description,
      // Reservation operations
      ...reservation.description,
      // Guest operations
      ...guest.description,
      // Room operations
      ...room.description,
      // Calendar operations
      ...calendar.description,
      // Transaction operations
      ...transaction.description,
      // Housekeeping operations
      ...housekeeping.description,
      // Report operations
      ...report.description,
      // Channel operations
      ...channel.description,
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    // Log licensing notice once per node load
    if (!licensingNoticeLogged) {
      console.warn(LICENSING_NOTICE);
      licensingNoticeLogged = true;
    }

    const items = this.getInputData();
    const resource = this.getNodeParameter('resource', 0) as string;

    let returnData: INodeExecutionData[] = [];

    switch (resource) {
      case 'property':
        returnData = await property.execute.call(this, items);
        break;
      case 'reservation':
        returnData = await reservation.execute.call(this, items);
        break;
      case 'guest':
        returnData = await guest.execute.call(this, items);
        break;
      case 'room':
        returnData = await room.execute.call(this, items);
        break;
      case 'calendar':
        returnData = await calendar.execute.call(this, items);
        break;
      case 'transaction':
        returnData = await transaction.execute.call(this, items);
        break;
      case 'housekeeping':
        returnData = await housekeeping.execute.call(this, items);
        break;
      case 'report':
        returnData = await report.execute.call(this, items);
        break;
      case 'channel':
        returnData = await channel.execute.call(this, items);
        break;
      default:
        throw new Error(`Unknown resource: ${resource}`);
    }

    return [returnData];
  }
}
