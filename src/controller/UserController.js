import { signToken, verifyToken } from "../helper/jwt.js"
import { responseBody } from "../helper/response.js"
import wsSend from "../helper/wsSend.js"
import * as browserSession from "./PuppeteerController.js"
import { writeFileSync, readFileSync, existsSync } from "node:fs"

let auth
const cookiesPath = './cookies.txt'
export function login(req, res) {
    try {
        if (req.body) {
            auth = req.body
            return responseBody(201, res, 'trying to login')
        }
    } catch (error) {
        return responseBody(403, res, error.message)
    }
}

export async function isAuth(req, res) {
    try {
        if (existsSync('./cookies.txt')) {
            const headerToken = req.headers['token_client']
            if (!headerToken) {
                throw new Error('token not found')
            }
            const decode = await verifyToken(headerToken)
            return responseBody(200, res, decode.email)
        }
        return responseBody(404, res, 'Cookies not found, please re-login')
    } catch (error) {
        return responseBody(401, res, error.message)
    }
}

export async function loginBrowser(ws, data, req) {
    try {
        const url = "https://vueschool.io/login"
        const page = await browserSession.createPage()
        const payload = {
            email: auth.email
        }
        const token = await signToken(payload)
        wsSend(ws, 'login', 2, 'run scraping login, please wait...')
        await page.goto(url)
        const getUrl = await page.url()
        if (getUrl != url) {
            wsSend(ws, 'login', 1, token)
            ws.terminate()
            return
        }

        const emailFill = await page.$('input[type="text"]');
        const passwordFill = await page.$('input[type="password"]');

        await emailFill.type(auth.email);
        await passwordFill.type(auth.password);
        await passwordFill.press("Enter");

        await page.waitForNavigation();
        await page.goto("https://vueschool.io/profile/account");

        const authCookies = await page.cookies();

        const saveAuthCookies = JSON.stringify(authCookies);
        writeFileSync(cookiesPath, saveAuthCookies);

        wsSend(ws, 'login', 1, token)

        await page.close()
        ws.terminate()
    } catch (error) {
        wsSend(ws, 'login', 3, error.message)
        ws.terminate()
        console.log(error)
    }
}