/*
 * Copyright (c) Velocity BPA, LLC
 * Licensed under the Business Source License 1.1
 * Commercial use requires a separate commercial license.
 * See LICENSE file for details.
 */

/// <reference types="jest" />

/**
 * Jest Test Setup
 * Configures global test environment for n8n-nodes-cloudbeds
 */

// Mock n8n-workflow module
jest.mock('n8n-workflow', () => ({
  NodeApiError: class NodeApiError extends Error {
    constructor(_node: unknown, error: { message?: string }) {
      super(error.message || 'API Error');
      this.name = 'NodeApiError';
    }
  },
  NodeOperationError: class NodeOperationError extends Error {
    constructor(_node: unknown, message: string) {
      super(message);
      this.name = 'NodeOperationError';
    }
  },
  NodeConnectionType: {
    Main: 'main',
  },
}));

// Mock console.warn to suppress licensing notices during tests
const originalWarn = console.warn;
beforeAll(() => {
  console.warn = jest.fn();
});

afterAll(() => {
  console.warn = originalWarn;
});

// Set default test timeout
jest.setTimeout(10000);

// Global test utilities
export const createMockExecuteFunctions = () => ({
  getNodeParameter: jest.fn(),
  getInputData: jest.fn().mockReturnValue([{ json: {} }]),
  getCredentials: jest.fn().mockResolvedValue({
    authType: 'apiKey',
    apiKey: 'test-api-key',
  }),
  helpers: {
    httpRequest: jest.fn(),
    requestWithAuthentication: jest.fn(),
  },
  getNode: jest.fn().mockReturnValue({ name: 'Cloudbeds' }),
  continueOnFail: jest.fn().mockReturnValue(false),
});

export const createMockWebhookFunctions = () => ({
  getNodeParameter: jest.fn(),
  getWebhookName: jest.fn().mockReturnValue('default'),
  getRequestObject: jest.fn(),
  getResponseObject: jest.fn(),
  getCredentials: jest.fn().mockResolvedValue({
    authType: 'apiKey',
    apiKey: 'test-api-key',
  }),
  helpers: {
    httpRequest: jest.fn(),
  },
  getNode: jest.fn().mockReturnValue({ name: 'CloudbedsTrigger' }),
  getNodeWebhookUrl: jest.fn().mockReturnValue('https://n8n.example.com/webhook/123'),
});
