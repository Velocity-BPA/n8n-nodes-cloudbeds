/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

import { INodePropertyOptions } from 'n8n-workflow';

export const RESERVATION_STATUSES: INodePropertyOptions[] = [
  { name: 'Confirmed', value: 'confirmed' },
  { name: 'Not Confirmed', value: 'not_confirmed' },
  { name: 'Canceled', value: 'canceled' },
  { name: 'Checked In', value: 'checked_in' },
  { name: 'Checked Out', value: 'checked_out' },
  { name: 'No Show', value: 'no_show' },
];

export const HOUSEKEEPING_STATUSES: INodePropertyOptions[] = [
  { name: 'Clean', value: 'clean' },
  { name: 'Dirty', value: 'dirty' },
  { name: 'Inspected', value: 'inspected' },
  { name: 'Out of Service', value: 'out_of_service' },
  { name: 'Out of Order', value: 'out_of_order' },
];

export const TRANSACTION_TYPES: INodePropertyOptions[] = [
  { name: 'Charge', value: 'charge' },
  { name: 'Payment', value: 'payment' },
  { name: 'Refund', value: 'refund' },
  { name: 'Adjustment', value: 'adjustment' },
];

export const PAYMENT_METHODS: INodePropertyOptions[] = [
  { name: 'Cash', value: 'cash' },
  { name: 'Credit Card', value: 'credit_card' },
  { name: 'Debit Card', value: 'debit_card' },
  { name: 'Bank Transfer', value: 'bank_transfer' },
  { name: 'Check', value: 'check' },
  { name: 'Other', value: 'other' },
];

export const REPORT_TYPES: INodePropertyOptions[] = [
  { name: 'Occupancy', value: 'occupancy' },
  { name: 'Revenue', value: 'revenue' },
  { name: 'Arrivals', value: 'arrivals' },
  { name: 'Departures', value: 'departures' },
  { name: 'Custom', value: 'custom' },
];

export function buildQueryString(
  params: Record<string, string | number | boolean | undefined>,
): Record<string, string | number | boolean> {
  const result: Record<string, string | number | boolean> = {};

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '' && value !== null) {
      result[key] = value;
    }
  }

  return result;
}

export function parseApiResponse<T>(response: unknown): T {
  if (typeof response === 'object' && response !== null && 'data' in response) {
    return (response as { data: T }).data;
  }
  return response as T;
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

export function getDateRangeDefault(): { startDate: string; endDate: string } {
  const today = new Date();
  const thirtyDaysLater = new Date(today);
  thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

  return {
    startDate: today.toISOString().split('T')[0],
    endDate: thirtyDaysLater.toISOString().split('T')[0],
  };
}
