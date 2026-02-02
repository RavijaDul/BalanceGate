'use strict';

import { lambdaHandler } from '../../app.mjs';
import { expect } from 'chai';
import jwt from 'jsonwebtoken';

// Mock user for testing
const mockUser = {
  sub: 'test-user-123',
  email: 'test@example.com'
};

// Create a mock JWT token
const createMockToken = () => {
  return jwt.sign(mockUser, 'secret');
};

describe('BalanceGate Wallet API Tests', function () {
  const mockToken = createMockToken();
  const mockApiKey = 'test-api-key';

  describe('CORS Preflight Tests', function () {
    it('should handle OPTIONS request', async () => {
      const event = {
        httpMethod: 'OPTIONS',
        headers: {}
      };

      const result = await lambdaHandler(event);

      expect(result).to.be.an('object');
      expect(result.statusCode).to.equal(200);
      expect(result.headers).to.have.property('Access-Control-Allow-Origin');
      expect(result.headers).to.have.property('Access-Control-Allow-Methods');
      expect(result.headers).to.have.property('Access-Control-Allow-Headers');
    });
  });

  describe('Authentication Tests', function () {
    it('should reject request without Authorization header', async () => {
      const event = {
        httpMethod: 'GET',
        path: '/wallets',
        headers: {}
      };

      const result = await lambdaHandler(event);

      expect(result.statusCode).to.equal(401);
      const body = JSON.parse(result.body);
      expect(body.message).to.equal('Unauthorized');
    });

    it('should reject request with invalid token', async () => {
      const event = {
        httpMethod: 'GET',
        path: '/wallets',
        headers: {
          Authorization: 'Bearer invalid-token'
        }
      };

      const result = await lambdaHandler(event);

      expect(result.statusCode).to.equal(401);
      const body = JSON.parse(result.body);
      expect(body.message).to.equal('Unauthorized');
    });
  });

  describe('Create Wallet Tests', function () {
    it('should create wallet with custom name and currency', async () => {
      const event = {
        httpMethod: 'POST',
        resource: '/wallet',
        path: '/wallet',
        headers: {
          Authorization: `Bearer ${mockToken}`
        },
        body: JSON.stringify({
          name: 'Savings Account',
          currency: 'EUR'
        })
      };

      const result = await lambdaHandler(event);

      expect(result.statusCode).to.equal(201);
      const wallet = JSON.parse(result.body);
      expect(wallet).to.have.property('walletId');
      expect(wallet.name).to.equal('Savings Account');
      expect(wallet.currency).to.equal('EUR');
      expect(wallet.balance).to.equal(0);
      expect(wallet).to.have.property('createdAt');
    });

    it('should create wallet with default values', async () => {
      const event = {
        httpMethod: 'POST',
        resource: '/wallet',
        path: '/wallet',
        headers: {
          Authorization: `Bearer ${mockToken}`
        },
        body: JSON.stringify({})
      };

      const result = await lambdaHandler(event);

      expect(result.statusCode).to.equal(201);
      const wallet = JSON.parse(result.body);
      expect(wallet.name).to.equal('Unnamed Wallet');
      expect(wallet.currency).to.equal('USD');
      expect(wallet.balance).to.equal(0);
    });
  });

  describe('Transaction Tests', function () {
    it('should reject transaction with non-numeric amount', async () => {
      const event = {
        httpMethod: 'POST',
        resource: '/wallet/{walletId}/transaction',
        path: '/wallet/test-wallet-id/transaction',
        pathParameters: {
          walletId: 'test-wallet-id'
        },
        headers: {
          Authorization: `Bearer ${mockToken}`
        },
        body: JSON.stringify({
          amount: 'invalid'
        })
      };

      const result = await lambdaHandler(event);

      expect(result.statusCode).to.equal(400);
      const body = JSON.parse(result.body);
      expect(body.message).to.equal('Amount must be a number');
    });
  });

  describe('Get Wallet Tests', function () {
    it('should reject request for missing walletId', async () => {
      const event = {
        httpMethod: 'GET',
        resource: '/wallet/{walletId}',
        path: '/wallet/',
        headers: {
          Authorization: `Bearer ${mockToken}`
        },
        pathParameters: null
      };

      const result = await lambdaHandler(event);

      expect(result.statusCode).to.equal(400);
      const body = JSON.parse(result.body);
      expect(body.message).to.equal('walletId is required');
    });
  });

  describe('Method Not Allowed Tests', function () {
    it('should return 405 for unsupported HTTP methods', async () => {
      const event = {
        httpMethod: 'DELETE',
        path: '/wallet/test-id',
        headers: {
          Authorization: `Bearer ${mockToken}`
        }
      };

      const result = await lambdaHandler(event);

      expect(result.statusCode).to.equal(405);
      const body = JSON.parse(result.body);
      expect(body.message).to.equal('Method Not Allowed');
    });
  });
});
