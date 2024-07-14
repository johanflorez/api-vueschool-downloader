import http from "http"
import { routeHandler } from "./src/helper/httpRouter.js"
import initRouter from "./src/router/router.js"
import { WebSocketServer } from "ws"
import setupWS from "./src/ws/wsHandler.js"

initRouter()

const server = http.createServer(routeHandler)
const ws = new WebSocketServer({ server })
setupWS(ws)
const port = 3000
console.log(`server listen: http://localhost:${port}`)
server.listen(port)