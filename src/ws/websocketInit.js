import { login } from "../controller/UserController.js"
import { wsHandlers, RegisterWsHandler } from "./wsHandlers.js"


export function initWS() {
    RegisterWsHandler('login', login)
    // RegisterWsHandler('getCourses', userController)
    // RegisterWsHandler('downloadCourses', userController)
}

export function setupWS(ws) {
    ws.on('connection', (socket, req) => {
        console.log('client connected')

        socket.on('message', (msg) => {
            wsHandlers(socket, msg, req)
        })

        socket.on('close', (msg) => {
            console.log('client closed connection', msg)
        })

        socket.on('error', console.error)

    })
    ws.on('close', () => {
        console.log('server socket closed')
    })
}