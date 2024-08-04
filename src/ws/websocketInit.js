import { GetCourses, GetSelectedLesson, GetVideoLesson } from "../controller/CoursesController.js"
import { downloaderRunner } from "../controller/DownloadController.js"
import { loginBrowser } from "../controller/UserController.js"
import { websocketMiddlewareUpgrade } from "../helper/Middleware.js"
import { wsHandlers, RegisterWsHandler } from "./wsHandlers.js"


export function initWS() {
    RegisterWsHandler('login', loginBrowser)
    RegisterWsHandler('getCourses', GetCourses)
    RegisterWsHandler('getSelectedLesson', GetSelectedLesson)
    RegisterWsHandler('getEachVideo', GetVideoLesson)
    RegisterWsHandler('downloader', downloaderRunner)
}

export function setupWS(server, wss) {
    server.on('upgrade', (req, socket, head) => {
        if (req.headers['websocket-key'] != 'secret-key') {
            socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n')
            socket.destroy()
            return
        }
        wss.handleUpgrade(req, socket, head, (ws) => {
            wss.emit('connection', ws, req)
        })
    })
    wss.on('connection', (ws, req) => {
        console.log('client connected')

        ws.on('message', (msg) => {
            wsHandlers(ws, msg, req)
        })

        ws.on('close', (msg) => {
            console.log('client closed connection', msg)
            ws.send('client disconnected')
        })

        ws.on('error', console.error)

    })

    wss.on('close', () => {
        console.log('server socket closed')
    })
}