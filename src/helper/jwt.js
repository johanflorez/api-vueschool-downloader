import jwt from 'jsonwebtoken'
import { rmSync } from 'node:fs'

const secretToken = 'jwt-puppeteer-secret-keys'

export function signToken(payload) {
    return new Promise((resolve, reject) => {
        jwt.sign(payload, secretToken, { expiresIn: '1d' }, (err, encoded) => {
            if (err) {
                reject(new Error('payload is invalid'))
            }
            resolve(encoded)
        })
    })
}

export function verifyToken(payload) {
    return new Promise((resolve, reject) => {
        jwt.verify(payload, secretToken, (err, decode) => {
            if (err) {
                rmSync('./cookies.txt')
                reject(new Error('token invalid please re-login'))
            }
            console.log('decode verify:', decode)
            resolve(decode)
        })
    })
}