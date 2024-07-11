import http from "http"
import { routeHandler } from "./src/helper/httpRouter.js"
import initRouter from "./src/router/router.js"

initRouter()

const server = http.createServer(routeHandler)

const port = 3000
console.log(`server listen: http://localhost:${port}`)
server.listen(port)