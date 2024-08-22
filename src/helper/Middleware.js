import bodyParser from "./bodyParses.js"
import { responseBody } from "./response.js"
import { getAuth } from "../controller/UserController.js"
import { verifyToken } from "./jwt.js"

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

export async function websocketMiddlewareMessage(ws, msg, req, next) {
    try {
        const headerToken = req.headers['authorization']
        if (!headerToken) {
            throw new Error('token not found')
        }
        const decode = await verifyToken(headerToken)
        const cookies = JSON.parse(decode.payload)
        req.cookies = cookies
        next()
    } catch (e) {
        ws.send(JSON.stringify({ type: 'login', message: e.message }))
    }
}