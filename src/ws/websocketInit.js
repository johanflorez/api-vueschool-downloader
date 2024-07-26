import { GetCourses, GetSelectedLesson, GetVideoLesson } from "../controller/CoursesController.js"
import { downloaderRunner } from "../controller/DownloadController.js"
import { loginBrowser } from "../controller/UserController.js"
import { wsHandlers, RegisterWsHandler } from "./wsHandlers.js"


export function initWS() {
    RegisterWsHandler('login', loginBrowser)
    RegisterWsHandler('getCourses', GetCourses)
    RegisterWsHandler('getSelectedLesson', GetSelectedLesson)
    RegisterWsHandler('getEachVideo', GetVideoLesson)
    RegisterWsHandler('downloader', downloaderRunner)
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