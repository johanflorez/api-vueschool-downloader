import { signToken } from "../helper/jwt.js"
import { responseBody } from "../helper/response.js"
import * as browserSession from "./PuppeteerController.js"
import fs from "node:fs"

let auth = null
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

export function getAuth(ws, data, req) {
    return new Promise((resolve, reject) => {
        try {
            const getAuth = fs.readFileSync("./cookies.txt");
            const cookies = JSON.parse(getAuth);
            ws.send("cookies found!");
            resolve(cookies)
        } catch (error) {
            reject(new Error('cookies not found please remove cookies file on project folder and try re-login'))
        }
    })
}


export async function loginBrowser(ws, data, req) {
    try {
        const page = await browserSession.createPage()
        ws.send(JSON.stringify({
            type: "login",
            msg: "open browser"
        }))
        await page.goto("https://vueschool.io/login")
        ws.send(JSON.stringify({
            type: "login",
            msg: "opening login page",
        }))
        const emailFill = await page.$('input[type="text"]');
        await emailFill.type(auth.email);
        const passwordFill = await page.$('input[type="password"]');
        await passwordFill.type(auth.password);
        await passwordFill.press("Enter");
        await page.waitForNavigation();
        await page.goto("https://vueschool.io/profile/account");
        ws.send(JSON.stringify({
            type: "login",
            msg: "success login"
        }))
        ws.send(JSON.stringify({
            type: "login",
            msg: "get cookies"
        }))
        let authCookies = await page.cookies();
        authCookies = JSON.stringify(authCookies);
        fs.writeFileSync("./cookies.txt", authCookies);
        const jwtToken = signToken(authCookies)

        ws.send(JSON.stringify({
            type: "login",
            msg: 'success save cookies to local',
            token: jwtToken
        }))
        await page.close()
        ws.terminate()
    } catch (error) {
        ws.send(JSON.stringify({
            type: "login",
            msg: error.message
        }))
        ws.terminate()
    }
}