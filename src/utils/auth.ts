import { Request, Response } from 'express';
import * as c from '../config/config';
import { NextFunction } from 'connect';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';


export async function generatePassword(plainTextPassword: string): Promise<string> {
    //Use Bcrypt to Generated Salted Hashed Passwords
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hash  = await bcrypt.hash(plainTextPassword, salt);
    return hash;
}


export async function comparePasswords(plainTextPassword: string, hash: string): Promise<boolean> {
    // Use Bcrypt to Compare your password to your Salted Hashed Password
    const compare = await bcrypt.compare(plainTextPassword, hash);
    return compare;
}


export function requireAuth(req: Request, res: Response, next: NextFunction) {
    if (!req.headers || !req.headers.authorization) {
      return res.status(401).send({message: 'No authorization headers.'});
    }
  
    const tokenBearer = req.headers.authorization.split(' ');
    if (tokenBearer.length != 2) {
      return res.status(401).send({message: 'Malformed token.'});
    }
  
    const token = tokenBearer[1];
    return jwt.verify(token, c.config.jwt.secret, (err, decoded) => {
      if (err) {
        return res.status(500).send({auth: false, message: 'Failed to authenticate.'});
      }
      return next();
    });
}
