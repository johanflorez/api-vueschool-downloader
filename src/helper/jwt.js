import jwt from 'jsonwebtoken'

const secretToken = 'jwt-puppeteer-secret-keys'

export function signToken(payload) {
    try {
        const tokenSign = jwt.sign({ payload }, secretToken, { expiresIn: '1d' })
        return tokenSign
    } catch (error) {
        throw new Error(error.message)
    }
}

export function verifyToken(payload) {
    return new Promise((resolve, reject) => {
        jwt.verify(payload, secretToken, (err, decode) => {
            if (err) {
                reject(new Error('token invalid please re-login'))
            }
            resolve(decode)
        })
    })
}