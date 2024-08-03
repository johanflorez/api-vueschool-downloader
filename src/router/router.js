import { login } from '../controller/UserController.js'
import { addRoute } from '../helper/httpRouter.js'
import { AuthMiddleware } from '../helper/Middleware.js'

export default function initRouter() {
    addRoute('POST', '/login', AuthMiddleware, login)
}