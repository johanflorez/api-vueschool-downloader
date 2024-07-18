import { login } from '../controller/UserController.js'
import { addRoute } from '../helper/httpRouter.js'

export default function initRouter() {
    addRoute('POST', '/login', login)
}