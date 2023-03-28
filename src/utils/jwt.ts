import { decode } from 'jsonwebtoken'

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