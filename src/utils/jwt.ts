import { decode } from 'jsonwebtoken'
import * as jwt from 'jsonwebtoken';
import * as c from '../config/config';

interface JwtPayload {
    id: string
    email: string
    name: string
    wallet_bal: number  
}


export function decodeJwt(tokenBearer: string[]) {
    const token = tokenBearer[1];
    const decodedJwt = decode(token) as JwtPayload
    return decodedJwt
}


export function generateJWT(user: any): string {
    //Use jwt to create a new JWT Payload containing
    return jwt.sign(JSON.stringify(user), c.config.jwt.secret);
}