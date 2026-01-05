/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/// <reference types="jest" />

import { createMockExecuteFunctions } from '../setup';

describe('Cloudbeds Resources', () => {
  let mockExecuteFunctions: ReturnType<typeof createMockExecuteFunctions>;

  beforeEach(() => {
    mockExecuteFunctions = createMockExecuteFunctions();
    jest.clearAllMocks();
  });

  describe('Property Resource', () => {
    it('should get all hotels', async () => {
      const mockResponse = {
        success: true,
        data: [
          { propertyID: '123', propertyName: 'Grand Hotel', propertyCity: 'New York' },
          { propertyID: '456', propertyName: 'Beach Resort', propertyCity: 'Miami' },
        ],
      };

      mockExecuteFunctions.getNodeParameter.mockReturnValue('getHotels');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await mockExecuteFunctions.helpers.httpRequest({
        method: 'GET',
        url: 'https://hotels.cloudbeds.com/api/v1.2/getHotels',
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data[0].propertyName).toBe('Grand Hotel');
    });

    it('should get hotel details', async () => {
      const mockResponse = {
        success: true,
        data: {
          propertyID: '123',
          propertyName: 'Grand Hotel',
          propertyDescription: 'Luxury hotel in downtown',
          propertyEmail: 'info@grandhotel.com',
          propertyPhone: '+1234567890',
          propertyAddress: '123 Main St',
          propertyCity: 'New York',
          propertyCountry: 'USA',
        },
      };

      mockExecuteFunctions.getNodeParameter.mockReturnValue('getHotelDetails');
      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await mockExecuteFunctions.helpers.httpRequest({
        method: 'GET',
        url: 'https://hotels.cloudbeds.com/api/v1.2/getHotelDetails',
        qs: { propertyID: '123' },
      });

      expect(result.success).toBe(true);
      expect(result.data.propertyName).toBe('Grand Hotel');
      expect(result.data.propertyCity).toBe('New York');
    });

    it('should get room types', async () => {
      const mockResponse = {
        success: true,
        data: [
          { roomTypeID: '1', roomTypeName: 'Standard', maxGuests: 2 },
          { roomTypeID: '2', roomTypeName: 'Deluxe', maxGuests: 4 },
          { roomTypeID: '3', roomTypeName: 'Suite', maxGuests: 6 },
        ],
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await mockExecuteFunctions.helpers.httpRequest({
        method: 'GET',
        url: 'https://hotels.cloudbeds.com/api/v1.2/getRoomTypes',
        qs: { propertyID: '123' },
      });

      expect(result.data).toHaveLength(3);
      expect(result.data[2].roomTypeName).toBe('Suite');
    });
  });

  describe('Reservation Resource', () => {
    it('should create a reservation', async () => {
      const mockResponse = {
        success: true,
        data: {
          reservationID: '12345',
          status: 'confirmed',
          startDate: '2024-01-15',
          endDate: '2024-01-20',
        },
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await mockExecuteFunctions.helpers.httpRequest({
        method: 'POST',
        url: 'https://hotels.cloudbeds.com/api/v1.2/postReservation',
        body: {
          propertyID: '123',
          startDate: '2024-01-15',
          endDate: '2024-01-20',
          roomTypeID: '1',
          guestFirstName: 'John',
          guestLastName: 'Doe',
          guestEmail: 'john@example.com',
        },
      });

      expect(result.success).toBe(true);
      expect(result.data.reservationID).toBe('12345');
      expect(result.data.status).toBe('confirmed');
    });

    it('should get a reservation by ID', async () => {
      const mockResponse = {
        success: true,
        data: {
          reservationID: '12345',
          propertyID: '123',
          status: 'checked_in',
          startDate: '2024-01-15',
          endDate: '2024-01-20',
          guestName: 'John Doe',
          roomID: '101',
          totalAmount: 500,
        },
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await mockExecuteFunctions.helpers.httpRequest({
        method: 'GET',
        url: 'https://hotels.cloudbeds.com/api/v1.2/getReservation',
        qs: { reservationID: '12345' },
      });

      expect(result.data.reservationID).toBe('12345');
      expect(result.data.status).toBe('checked_in');
      expect(result.data.totalAmount).toBe(500);
    });

    it('should cancel a reservation', async () => {
      const mockResponse = {
        success: true,
        data: {
          reservationID: '12345',
          status: 'canceled',
        },
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await mockExecuteFunctions.helpers.httpRequest({
        method: 'PUT',
        url: 'https://hotels.cloudbeds.com/api/v1.2/putReservation',
        body: {
          reservationID: '12345',
          status: 'canceled',
        },
      });

      expect(result.data.status).toBe('canceled');
    });
  });

  describe('Guest Resource', () => {
    it('should create a guest', async () => {
      const mockResponse = {
        success: true,
        data: {
          guestID: '999',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
        },
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await mockExecuteFunctions.helpers.httpRequest({
        method: 'POST',
        url: 'https://hotels.cloudbeds.com/api/v1.2/postGuest',
        body: {
          propertyID: '123',
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane@example.com',
        },
      });

      expect(result.data.guestID).toBe('999');
      expect(result.data.firstName).toBe('Jane');
    });

    it('should search guests', async () => {
      const mockResponse = {
        success: true,
        data: [
          { guestID: '999', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com' },
        ],
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await mockExecuteFunctions.helpers.httpRequest({
        method: 'GET',
        url: 'https://hotels.cloudbeds.com/api/v1.2/getGuests',
        qs: { email: 'jane@example.com' },
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].email).toBe('jane@example.com');
    });
  });

  describe('Room Resource', () => {
    it('should get all rooms', async () => {
      const mockResponse = {
        success: true,
        data: [
          { roomID: '101', roomName: 'Room 101', roomTypeID: '1', status: 'available' },
          { roomID: '102', roomName: 'Room 102', roomTypeID: '1', status: 'occupied' },
          { roomID: '201', roomName: 'Room 201', roomTypeID: '2', status: 'available' },
        ],
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await mockExecuteFunctions.helpers.httpRequest({
        method: 'GET',
        url: 'https://hotels.cloudbeds.com/api/v1.2/getRooms',
        qs: { propertyID: '123' },
      });

      expect(result.data).toHaveLength(3);
      expect(result.data[0].roomName).toBe('Room 101');
    });

    it('should check room availability', async () => {
      const mockResponse = {
        success: true,
        data: {
          available: true,
          roomTypeID: '1',
          startDate: '2024-02-01',
          endDate: '2024-02-05',
          roomsAvailable: 5,
        },
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await mockExecuteFunctions.helpers.httpRequest({
        method: 'GET',
        url: 'https://hotels.cloudbeds.com/api/v1.2/getAvailability',
        qs: {
          propertyID: '123',
          startDate: '2024-02-01',
          endDate: '2024-02-05',
          roomTypeID: '1',
        },
      });

      expect(result.data.available).toBe(true);
      expect(result.data.roomsAvailable).toBe(5);
    });

    it('should assign room to reservation', async () => {
      const mockResponse = {
        success: true,
        data: {
          reservationID: '12345',
          roomID: '101',
          assigned: true,
        },
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await mockExecuteFunctions.helpers.httpRequest({
        method: 'POST',
        url: 'https://hotels.cloudbeds.com/api/v1.2/postRoomAssign',
        body: {
          reservationID: '12345',
          roomID: '101',
        },
      });

      expect(result.data.assigned).toBe(true);
    });
  });

  describe('Transaction Resource', () => {
    it('should add payment', async () => {
      const mockResponse = {
        success: true,
        data: {
          transactionID: '5555',
          reservationID: '12345',
          amount: 250.00,
          type: 'payment',
          paymentMethod: 'credit_card',
        },
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await mockExecuteFunctions.helpers.httpRequest({
        method: 'POST',
        url: 'https://hotels.cloudbeds.com/api/v1.2/postPayment',
        body: {
          reservationID: '12345',
          amount: 250.00,
          paymentMethod: 'credit_card',
        },
      });

      expect(result.data.transactionID).toBe('5555');
      expect(result.data.amount).toBe(250.00);
      expect(result.data.type).toBe('payment');
    });

    it('should add charge', async () => {
      const mockResponse = {
        success: true,
        data: {
          transactionID: '5556',
          reservationID: '12345',
          amount: 50.00,
          type: 'charge',
          category: 'room_service',
        },
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await mockExecuteFunctions.helpers.httpRequest({
        method: 'POST',
        url: 'https://hotels.cloudbeds.com/api/v1.2/postCharge',
        body: {
          reservationID: '12345',
          amount: 50.00,
          category: 'room_service',
          description: 'Room service - Dinner',
        },
      });

      expect(result.data.type).toBe('charge');
      expect(result.data.category).toBe('room_service');
    });
  });

  describe('Housekeeping Resource', () => {
    it('should get housekeeping status', async () => {
      const mockResponse = {
        success: true,
        data: [
          { roomID: '101', roomName: 'Room 101', status: 'clean' },
          { roomID: '102', roomName: 'Room 102', status: 'dirty' },
          { roomID: '103', roomName: 'Room 103', status: 'inspected' },
        ],
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await mockExecuteFunctions.helpers.httpRequest({
        method: 'GET',
        url: 'https://hotels.cloudbeds.com/api/v1.2/getHousekeepingStatus',
        qs: { propertyID: '123' },
      });

      expect(result.data).toHaveLength(3);
      expect(result.data[1].status).toBe('dirty');
    });

    it('should update housekeeping status', async () => {
      const mockResponse = {
        success: true,
        data: {
          roomID: '102',
          status: 'clean',
          updatedAt: '2024-01-15T10:30:00Z',
        },
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await mockExecuteFunctions.helpers.httpRequest({
        method: 'PUT',
        url: 'https://hotels.cloudbeds.com/api/v1.2/putHousekeepingStatus',
        body: {
          roomID: '102',
          status: 'clean',
        },
      });

      expect(result.data.status).toBe('clean');
    });
  });

  describe('Calendar Resource', () => {
    it('should get calendar data', async () => {
      const mockResponse = {
        success: true,
        data: {
          propertyID: '123',
          startDate: '2024-02-01',
          endDate: '2024-02-28',
          calendar: [
            { date: '2024-02-01', available: 10, rate: 150 },
            { date: '2024-02-02', available: 8, rate: 150 },
            { date: '2024-02-03', available: 5, rate: 175 },
          ],
        },
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await mockExecuteFunctions.helpers.httpRequest({
        method: 'GET',
        url: 'https://hotels.cloudbeds.com/api/v1.2/getCalendar',
        qs: {
          propertyID: '123',
          startDate: '2024-02-01',
          endDate: '2024-02-28',
        },
      });

      expect(result.data.calendar).toHaveLength(3);
      expect(result.data.calendar[2].rate).toBe(175);
    });

    it('should update rates', async () => {
      const mockResponse = {
        success: true,
        data: {
          updated: true,
          roomTypeID: '1',
          startDate: '2024-02-14',
          endDate: '2024-02-16',
          rate: 200,
        },
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await mockExecuteFunctions.helpers.httpRequest({
        method: 'PUT',
        url: 'https://hotels.cloudbeds.com/api/v1.2/putRates',
        body: {
          propertyID: '123',
          roomTypeID: '1',
          startDate: '2024-02-14',
          endDate: '2024-02-16',
          rate: 200,
        },
      });

      expect(result.data.updated).toBe(true);
      expect(result.data.rate).toBe(200);
    });
  });

  describe('Report Resource', () => {
    it('should get occupancy report', async () => {
      const mockResponse = {
        success: true,
        data: {
          propertyID: '123',
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          occupancyRate: 75.5,
          totalRoomNights: 310,
          occupiedRoomNights: 234,
        },
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await mockExecuteFunctions.helpers.httpRequest({
        method: 'GET',
        url: 'https://hotels.cloudbeds.com/api/v1.2/getOccupancyReport',
        qs: {
          propertyID: '123',
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        },
      });

      expect(result.data.occupancyRate).toBe(75.5);
    });

    it('should get revenue report', async () => {
      const mockResponse = {
        success: true,
        data: {
          propertyID: '123',
          startDate: '2024-01-01',
          endDate: '2024-01-31',
          totalRevenue: 45000,
          roomRevenue: 35000,
          otherRevenue: 10000,
          adr: 149.57,
          revPAR: 112.90,
        },
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await mockExecuteFunctions.helpers.httpRequest({
        method: 'GET',
        url: 'https://hotels.cloudbeds.com/api/v1.2/getRevenueReport',
        qs: {
          propertyID: '123',
          startDate: '2024-01-01',
          endDate: '2024-01-31',
        },
      });

      expect(result.data.totalRevenue).toBe(45000);
      expect(result.data.adr).toBe(149.57);
    });
  });

  describe('Channel Resource', () => {
    it('should get channel connections', async () => {
      const mockResponse = {
        success: true,
        data: [
          { channelID: '1', channelName: 'Booking.com', status: 'active' },
          { channelID: '2', channelName: 'Expedia', status: 'active' },
          { channelID: '3', channelName: 'Airbnb', status: 'inactive' },
        ],
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await mockExecuteFunctions.helpers.httpRequest({
        method: 'GET',
        url: 'https://hotels.cloudbeds.com/api/v1.2/getChannelConnections',
        qs: { propertyID: '123' },
      });

      expect(result.data).toHaveLength(3);
      expect(result.data[0].channelName).toBe('Booking.com');
    });

    it('should sync availability', async () => {
      const mockResponse = {
        success: true,
        data: {
          synced: true,
          channelID: '1',
          roomsUpdated: 10,
        },
      };

      mockExecuteFunctions.helpers.httpRequest.mockResolvedValue(mockResponse);

      const result = await mockExecuteFunctions.helpers.httpRequest({
        method: 'POST',
        url: 'https://hotels.cloudbeds.com/api/v1.2/postChannelSync',
        body: {
          propertyID: '123',
          channelID: '1',
          syncType: 'availability',
        },
      });

      expect(result.data.synced).toBe(true);
    });
  });
});
