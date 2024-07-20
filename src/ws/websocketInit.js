import { GetCourses, GetSelectonLesson, GetVideoLesson } from "../controller/CoursesController.js"
import { loginBrowser } from "../controller/UserController.js"
import { wsHandlers, RegisterWsHandler } from "./wsHandlers.js"


export function initWS() {
    RegisterWsHandler('login', loginBrowser)
    RegisterWsHandler('getCourses', GetCourses)
    RegisterWsHandler('getSelectedLesson', GetSelectonLesson)
    RegisterWsHandler('getEachVideo', GetVideoLesson)
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