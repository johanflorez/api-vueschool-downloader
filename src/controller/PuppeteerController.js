import puppeteer from "puppeteer"

let Browser = null

export async function openBrowser() {
    if (!Browser) {
        Browser = await puppeteer.launch({ headless: true })
    }
    return Browser
}

export async function closeBrowser(Browser) {
    if (Browser) {
        await Browser.close()
        Browser = null
    }
}
export async function createPage(Browser) {
    if (!Browser) {
        throw new Error('Browser not launched yet')
    }
    return Browser.newPage()
}

export async function log() {
    return Browser
}
