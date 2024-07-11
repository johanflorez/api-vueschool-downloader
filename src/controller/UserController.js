import { responseBody } from "../helper/response.js"

class userController {
    constructor(req, res) { this.req = req, this.res = res }
    static store(req, res) {
        req.on('data', (data) => {
            responseBody(200, res, data)
        })
    }
}

export default userController