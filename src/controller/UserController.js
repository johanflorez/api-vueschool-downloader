import bodyParser from "../helper/bodyParses.js"
import { responseBody } from "../helper/response.js"
// import PuppeteerController from "./PuppeteerController.js"

let auth = null
export async function login(req, res) {
    try {
        auth = await bodyParser(req)
        return responseBody(201, res, 'trying to login')
    } catch (error) {
        return responseBody(403, res, error.message)
    }
}

export async function loginBrowser(socket, data, req, puppeteer) {
    socket.send(JSON.stringify({
        type: "login",
        msg: "open browser"
    }))
    await page.goto("https://vueschool.io/login")
    socket.send(JSON.stringify({
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
    socket.send(JSON.stringify({
        type: "login",
        msg: "success login"
    }))
    socket.send(JSON.stringify({
        type: "login",
        msg: "get cookies"
    }))
    let authCookies = await page.cookies();
    socket.send(JSON.stringify({
        type: "login",
        cookies: authCookies
    }))
}