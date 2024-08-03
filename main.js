import http from "http"
import { routeHandler } from "./src/router/routeHandler.js"
import initRouter from "./src/router/router.js"
import { WebSocketServer } from "ws"
import { setupWS, initWS } from "./src/ws/websocketInit.js"
import * as browserSession from "./src/controller/PuppeteerController.js"
import dotenv from "dotenv";
dotenv.config();

await browserSession.initBrowser()
initRouter()
initWS()

const server = http.createServer(routeHandler)
const ws = new WebSocketServer({ server })

setupWS(ws)

const port = 3000
console.log(`server listen: http://localhost:${port}`)
server.listen(port)