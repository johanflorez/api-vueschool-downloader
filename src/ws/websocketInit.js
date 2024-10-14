import { GetCourses, GetSelectedLesson, GetVideoLesson } from "../controller/CoursesController.js"
import { downloaderRunner } from "../controller/DownloadController.js"
import { loginBrowser } from "../controller/UserController.js"
import { websocketMiddlewareMessage } from "../helper/Middleware.js"
import { wsHandlers, RegisterWsHandler } from "./wsHandlers.js"


export function initWS() {
    RegisterWsHandler('login', loginBrowser)
    RegisterWsHandler('getCourses', websocketMiddlewareMessage, GetCourses)
    RegisterWsHandler('getSelectedLesson', websocketMiddlewareMessage, GetSelectedLesson)
    RegisterWsHandler('getEachVideo', websocketMiddlewareMessage, GetVideoLesson)
    RegisterWsHandler('downloader', websocketMiddlewareMessage, downloaderRunner)
}

export function setupWS(server, wss) {

    wss.on('connection', (ws, req) => {
        console.log('client connected')

        ws.on('message', (data) => {
            wsHandlers(ws, data, req)
        })

        ws.on('close', (data) => {
            console.log('client closed connection', data)
            ws.send('client disconnected')
        })

        ws.on('error', console.error)

    })

    server.on('upgrade', (req, socket, head) => {
        wss.handleUpgrade(req, socket, head, (ws) => {
            wss.emit('connection', ws, req)
        })
    })

    wss.on('close', () => {
        console.log('server socket closed')
    })
}