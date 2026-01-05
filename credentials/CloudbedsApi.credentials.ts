/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class CloudbedsApi implements ICredentialType {
  name = 'cloudbedsApi';
  displayName = 'Cloudbeds API';
  documentationUrl = 'https://hotels.cloudbeds.com/api/docs/';
  properties: INodeProperties[] = [
    {
      displayName: 'Authentication Type',
      name: 'authType',
      type: 'options',
      options: [
        {
          name: 'API Key',
          value: 'apiKey',
        },
        {
          name: 'OAuth 2.0',
          value: 'oauth2',
        },
      ],
      default: 'apiKey',
      description: 'The authentication method to use',
    },
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      displayOptions: {
        show: {
          authType: ['apiKey'],
        },
      },
      description: 'Your Cloudbeds API key',
    },
    {
      displayName: 'Client ID',
      name: 'clientId',
      type: 'string',
      default: '',
      displayOptions: {
        show: {
          authType: ['oauth2'],
        },
      },
      description: 'OAuth 2.0 Client ID',
    },
    {
      displayName: 'Client Secret',
      name: 'clientSecret',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      displayOptions: {
        show: {
          authType: ['oauth2'],
        },
      },
      description: 'OAuth 2.0 Client Secret',
    },
    {
      displayName: 'Access Token',
      name: 'accessToken',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      displayOptions: {
        show: {
          authType: ['oauth2'],
        },
      },
      description: 'OAuth 2.0 Access Token (if already obtained)',
    },
    {
      displayName: 'Refresh Token',
      name: 'refreshToken',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      displayOptions: {
        show: {
          authType: ['oauth2'],
        },
      },
      description: 'OAuth 2.0 Refresh Token (for token renewal)',
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        Authorization: '={{$credentials.authType === "apiKey" ? "Bearer " + $credentials.apiKey : "Bearer " + $credentials.accessToken}}',
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: 'https://hotels.cloudbeds.com/api/v1.2',
      url: '/getHotels',
      method: 'GET',
    },
  };
}
