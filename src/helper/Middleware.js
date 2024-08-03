import bodyParser from "./bodyParses.js"
import { responseBody } from "./response.js"

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

export function websocketMiddleware(socket, msg, req) {
    try {

    } catch (error) {

    }
}