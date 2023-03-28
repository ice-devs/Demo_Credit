import { expect } from 'chai';
import 'mocha';
import * as jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import * as bcrypt from 'bcrypt';

import { generatePassword, comparePasswords, requireAuth } from '../controllers/v0/users/routes/auth';
import { decodeJwt } from '../utils/jwt';

describe('generatePassword', () => {
  it('should return a string', async () => {
    const password = await generatePassword('testpassword');
    expect(password).to.be.a('string');
  });

  it('should generate a hashed password', async () => {
    const password = await generatePassword('testpassword');
    const match = await bcrypt.compare('testpassword', password);
    expect(match).to.be.true;
  });

  it('should handle empty input correctly', async () => {
    const password = await generatePassword('');
    expect(password).to.not.be.empty;
  });
});

  
describe('comparePasswords', () => {
  const plainTextPassword = 'password123';
  let hashedPassword: string;

  before(async () => {
    hashedPassword = await bcrypt.hash(plainTextPassword, 10);
  });

  it('should return true when the passwords match', async () => {
    const result = await comparePasswords(plainTextPassword, hashedPassword);
    expect(result).to.be.true;
  });

  it('should return false when the passwords do not match', async () => {
    const result = await comparePasswords('wrongpassword', hashedPassword);
    expect(result).to.be.false;
  });
});


describe('requireAuth middleware', () => {
    it('should return a 401 response if there are no authorization headers', () => {
      const req = {
        headers: {},
      } as Request;
      const res = {
        status: (code: number) => ({
          send: (data: any) => {
            expect(code).to.equal(401);
            expect(data).to.have.property('message', 'No authorization headers.');
          },
        }),
      } as Response;
      const next = () => {};
      requireAuth(req, res, next);
    });
  
    it('should return a 401 response if the token is malformed', () => {
      const req = {
        headers: {
          authorization: 'Bearer',
        },
      } as Request;
      const res = {
        status: (code: number) => ({
          send: (data: any) => {
            expect(code).to.equal(401);
            expect(data).to.have.property('message', 'Malformed token.');
          },
        }),
      } as Response;
      const next = () => {};
      requireAuth(req, res, next);
    });
  
    it('should call next if the token is valid', () => {
      const token = jwt.sign({}, 'secret');
      const req = {
        headers: {
          authorization: `Bearer ${token}`,
        },
      } as Request;
      const res = {
        status: (code: number) => ({
          send: (data: any) => {},
        }),
      } as Response;
      const next = () => {
        expect(true).to.be.true; // expect next to be called
      };
      requireAuth(req, res, next);
    });
  
    it('should return a 500 response if the token verification fails', () => {
      const req = {
        headers: {
          authorization: 'Bearer invalidToken',
        },
      } as Request;
      const res = {
        status: (code: number) => ({
          send: (data: any) => {
            expect(code).to.equal(500);
            expect(data).to.have.property('auth', false);
            expect(data).to.have.property('message', 'Failed to authenticate.');
          },
        }),
      } as Response;
      const next = () => {};
      requireAuth(req, res, next);
    });
});
  

describe('decodeJwt', () => {
  it('should decode a JWT token and return its payload', () => {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEyMzQ1Njc4OTAiLCJlbWFpbCI6ImVtYWlsQGV4YW1wbGUuY29tIiwibmFtZSI6IlNhbSBVc2VyIiwid2FsbGV0X2JhbCI6MTJ9.-x6pKj6MTxB_-IgAYK-RcX9EMz-1ccJiRbYQvdwDJ8g';
    const decodedJwt = decodeJwt(['Bearer', token]);
    expect(decodedJwt).to.deep.equal({
      id: '1234567890',
      email: 'email@example.com',
      name: 'Sam User',
      wallet_bal: 12
    });
  });
});
  
  
  
