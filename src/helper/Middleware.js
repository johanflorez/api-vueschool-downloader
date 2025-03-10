import bodyParser from "./bodyParses.js"
import { responseBody } from "./response.js"
import { verifyToken } from "./jwt.js"
import { readFileSync, existsSync } from 'node:fs';
import wsSend from "./wsSend.js";

export async function AuthMiddleware(req, res, next) {
    try {
        req.body = await bodyParser(req)
        if (typeof req.body.email == "string" || typeof req.body.password == "string") {
            next()
        } else {
            responseBody(401, res, "unathorized")
        }
    } catch (error) {
        console.log(error)
        responseBody(500, res, error.message)
    }
}

export function websocketMiddlewareUpgrade(req, socket, head) {
    if (req.headers['websocket-key'] != 'secret-key') {
        socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
        socket.destroy()
        return
    }
}

export async function websocketMiddlewareMessage(ws, data, req, next) {
    try {
        const token = data.token
        const cancelType = data.type
        if (cancelType == 'cancel') throw new Error('process cancelled')
        if (!token) throw new Error('token not found')
        if (existsSync('./cookies.txt')) {
            const cookieFile = readFileSync('./cookies.txt', 'utf-8')
            await verifyToken(token)
            req.cookies = JSON.parse(cookieFile)
            next()
        } else {
            wsSend(ws, 'error', 3, 'cookies not found, please re-login')
        }
    } catch (e) {
        wsSend(ws, 'error', 3, e.message)
    }
}