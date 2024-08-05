import bodyParser from "./bodyParses.js"
import { responseBody } from "./response.js"
import { getAuth } from "../controller/UserController.js"

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
        const cookies = await getAuth(ws, msg, req)
        req.cookies = cookies
        next()
    } catch (error) {
        ws.send(JSON.stringify({ type: 'login', message: error }))
    }
}