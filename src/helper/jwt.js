import jwt from 'jsonwebtoken'

const key = 'jwt-puppeteer-secret-key'

export function signToken(payload) {
    try {
        const tokenSign = jwt.sign({ payload }, key)
        return tokenSign
    } catch (error) {
        throw new Error(error.message)
    }
}

export function verifyToken(payload) {
    try {
        const tokenVerify = jwt.verify(payload, key)
        return tokenVerify
    } catch (error) {
        throw new Error(error.message)
    }
}