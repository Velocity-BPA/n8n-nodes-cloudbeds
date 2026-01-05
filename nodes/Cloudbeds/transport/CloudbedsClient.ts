/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import {
  IExecuteFunctions,
  ILoadOptionsFunctions,
  IHttpRequestMethods,
  IHttpRequestOptions,
  NodeApiError,
} from 'n8n-workflow';

const BASE_URL = 'https://hotels.cloudbeds.com/api/v1.2';

export interface CloudbedsApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  count?: number;
  total?: number;
  message?: string;
  errors?: string[];
}

export interface CloudbedsPaginationParams {
  pageNumber?: number;
  pageSize?: number;
}

export async function cloudbedsApiRequest(
  this: IExecuteFunctions | ILoadOptionsFunctions,
  method: IHttpRequestMethods,
  endpoint: string,
  body?: object,
  query?: Record<string, string | number | boolean | undefined>,
): Promise<CloudbedsApiResponse> {
  const credentials = await this.getCredentials('cloudbedsApi');

  // Clean undefined values from query
  const cleanQuery: Record<string, string | number | boolean> = {};
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== '') {
        cleanQuery[key] = value;
      }
    }
  }

  const options: IHttpRequestOptions = {
    method,
    url: `${BASE_URL}${endpoint}`,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization:
        credentials.authType === 'apiKey'
          ? `Bearer ${credentials.apiKey}`
          : `Bearer ${credentials.accessToken}`,
    },
    qs: cleanQuery,
    body,
    json: true,
  };

  try {
    const response = (await this.helpers.httpRequest(options)) as CloudbedsApiResponse;

    if (!response.success) {
      throw new NodeApiError(this.getNode(), {
        message: response.message || 'Unknown Cloudbeds API error',
        description: response.errors?.join(', ') || 'No additional error details',
      });
    }

    return response;
  } catch (error) {
    if (error instanceof NodeApiError) {
      throw error;
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new NodeApiError(this.getNode(), {
      message: `Cloudbeds API request failed: ${errorMessage}`,
      description: 'Check your credentials and try again',
    });
  }
}

export async function cloudbedsApiRequestAllItems(
  this: IExecuteFunctions,
  method: IHttpRequestMethods,
  endpoint: string,
  body?: object,
  query?: Record<string, string | number | boolean | undefined>,
): Promise<unknown[]> {
  const returnData: unknown[] = [];
  let pageNumber = 0;
  const pageSize = 100;

  let response: CloudbedsApiResponse;

  do {
    response = await cloudbedsApiRequest.call(this, method, endpoint, body, {
      ...query,
      pageNumber,
      pageSize,
    });

    if (response.data && Array.isArray(response.data)) {
      returnData.push(...response.data);
    } else if (response.data) {
      returnData.push(response.data);
      break;
    }

    pageNumber++;
  } while (
    response.data &&
    Array.isArray(response.data) &&
    response.data.length === pageSize &&
    (response.total === undefined || returnData.length < response.total)
  );

  return returnData;
}

export function formatDate(date: string | Date): string {
  if (typeof date === 'string') {
    return date;
  }
  return date.toISOString().split('T')[0];
}

export function validateDateRange(startDate: string, endDate: string): void {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime())) {
    throw new Error('Invalid start date format. Use YYYY-MM-DD');
  }

  if (isNaN(end.getTime())) {
    throw new Error('Invalid end date format. Use YYYY-MM-DD');
  }

  if (start > end) {
    throw new Error('Start date must be before or equal to end date');
  }
}
