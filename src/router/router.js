import { isAuth, login } from '../controller/UserController.js'
import { addRoute } from './routeHandler.js'
import { AuthMiddleware } from '../helper/Middleware.js'

export default function initRouter() {
    addRoute('POST', '/login', AuthMiddleware, login)
    addRoute('GET', '/checkauth', isAuth)
}