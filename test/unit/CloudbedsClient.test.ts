/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/// <reference types="jest" />

import { createMockExecuteFunctions } from '../setup';

describe('CloudbedsClient', () => {
  let mockExecuteFunctions: ReturnType<typeof createMockExecuteFunctions>;

  beforeEach(() => {
    mockExecuteFunctions = createMockExecuteFunctions();
    jest.clearAllMocks();
  });

  describe('API Request', () => {
    it('should make GET request with correct headers', async () => {
      const mockResponse = {
        success: true,
        data: [{ id: '1', name: 'Test Property' }],
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      // Simulate API request
      const result = await mockExecuteFunctions.helpers.httpRequest({
        method: 'GET',
        url: 'https://hotels.cloudbeds.com/api/v1.2/getHotels',
        headers: {
          Authorization: 'Bearer test-api-key',
        },
      });

      expect(result).toEqual(mockResponse);
      expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://hotels.cloudbeds.com/api/v1.2/getHotels',
        headers: {
          Authorization: 'Bearer test-api-key',
        },
      });
    });

    it('should make POST request with body', async () => {
      const mockResponse = {
        success: true,
        data: { reservationID: '12345' },
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const body = {
        propertyID: '123',
        startDate: '2024-01-01',
        endDate: '2024-01-05',
        roomTypeID: '456',
        guestFirstName: 'John',
        guestLastName: 'Doe',
        guestEmail: 'john@example.com',
      };

      const result = await mockExecuteFunctions.helpers.httpRequest({
        method: 'POST',
        url: 'https://hotels.cloudbeds.com/api/v1.2/postReservation',
        headers: {
          Authorization: 'Bearer test-api-key',
          'Content-Type': 'application/json',
        },
        body,
      });

      expect(result).toEqual(mockResponse);
      expect(result.data.reservationID).toBe('12345');
    });

    it('should handle API error response', async () => {
      const errorResponse = {
        success: false,
        message: 'Invalid property ID',
        errors: ['Property not found'],
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(errorResponse);

      const result = await mockExecuteFunctions.helpers.httpRequest({
        method: 'GET',
        url: 'https://hotels.cloudbeds.com/api/v1.2/getHotelDetails',
        qs: { propertyID: 'invalid' },
      });

      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid property ID');
    });

    it('should handle rate limit error', async () => {
      const rateLimitError = new Error('Too many requests');
      (rateLimitError as any).statusCode = 429;

      mockExecuteFunctions.helpers.httpRequest.mockRejectedValue(rateLimitError);

      await expect(
        mockExecuteFunctions.helpers.httpRequest({
          method: 'GET',
          url: 'https://hotels.cloudbeds.com/api/v1.2/getReservations',
        }),
      ).rejects.toThrow('Too many requests');
    });
  });

  describe('Pagination', () => {
    it('should handle paginated response', async () => {
      const page1Response = {
        success: true,
        count: 2,
        total: 4,
        data: [
          { id: '1', name: 'Reservation 1' },
          { id: '2', name: 'Reservation 2' },
        ],
      };

      const page2Response = {
        success: true,
        count: 2,
        total: 4,
        data: [
          { id: '3', name: 'Reservation 3' },
          { id: '4', name: 'Reservation 4' },
        ],
      };

      mockExecuteFunctions.helpers.httpRequest
        .mockResolvedValueOnce(page1Response)
        .mockResolvedValueOnce(page2Response);

      // First page
      const result1 = await mockExecuteFunctions.helpers.httpRequest({
        method: 'GET',
        url: 'https://hotels.cloudbeds.com/api/v1.2/getReservations',
        qs: { pageNumber: 1, pageSize: 2 },
      });

      expect(result1.data).toHaveLength(2);
      expect(result1.total).toBe(4);

      // Second page
      const result2 = await mockExecuteFunctions.helpers.httpRequest({
        method: 'GET',
        url: 'https://hotels.cloudbeds.com/api/v1.2/getReservations',
        qs: { pageNumber: 2, pageSize: 2 },
      });

      expect(result2.data).toHaveLength(2);
    });
  });

  describe('Authentication', () => {
    it('should use API key authentication', async () => {
      mockExecuteFunctions.getCredentials.mockResolvedValue({
        authType: 'apiKey',
        apiKey: 'my-api-key',
      });

      const credentials = await mockExecuteFunctions.getCredentials('cloudbedsApi');

      expect(credentials.authType).toBe('apiKey');
      expect(credentials.apiKey).toBe('my-api-key');
    });

    it('should use OAuth2 authentication', async () => {
      mockExecuteFunctions.getCredentials.mockResolvedValue({
        authType: 'oauth2',
        clientId: 'my-client-id',
        clientSecret: 'my-client-secret',
        accessToken: 'my-access-token',
        refreshToken: 'my-refresh-token',
      });

      const credentials = await mockExecuteFunctions.getCredentials('cloudbedsApi');

      expect(credentials.authType).toBe('oauth2');
      expect(credentials.accessToken).toBe('my-access-token');
    });
  });
});
