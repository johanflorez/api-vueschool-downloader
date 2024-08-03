import puppeteer from "puppeteer"

let Browser = null
export async function initBrowser() {
    if (!Browser) {
        Browser = await puppeteer.launch({
            headless: true,
            args: [
                '--enable-features=DnsOverHttps,ThirdPartyCookiesEnabled',
                '--dns-over-https-resolver=https://cloudflare-dns.com/dns-query'
            ]
        })
        await new Promise(resolve => setTimeout(resolve, 5000));
        console.log('init browser')
    }

}

export async function closeBrowser() {
    if (Browser) {
        await Browser.close()
        Browser = null
    }
}
export async function createPage() {
    if (!Browser) {
        throw new Error('Browser not launched yet')
    }
    return await Browser.newPage()
}

export async function log() {
    return Browser
}
