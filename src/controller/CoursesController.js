import wsSend from "../helper/wsSend.js"
import * as browserSession from "./PuppeteerController.js"
import fs from "fs"

const coursesUrl = "https://vueschool.io/courses"
export async function GetCourses(ws, data, req) {
    try {
        const page = await browserSession.createPage()
        wsSend(ws, 'getCourses', 2, 'scraping courses, please wait...')
        await page.goto(coursesUrl, { waitUntil: "networkidle0" });
        await page.setCookie(...req.cookies)
        await page.reload({ waitUntil: "networkidle0" })
        const getEachCourse = await page.$$eval("a.thumb-card", (el) => {
            return el.map((e, i) => {
                const title = e.querySelector("h3.text-xl").innerText;
                const url = e.getAttribute("href");
                const cat = e.querySelectorAll('div.inline-block.px-3')
                const findLessons = e.querySelectorAll('span.mt-1')
                const lessons = Array.from(findLessons).map((el) => el.innerText)
                const regex = /\(\"(.*?)\"\)/;
                const findThumbnail = e
                    .querySelector("div.thumbnail")
                    .getAttribute("style")
                    .match(regex);
                const thumbnail = findThumbnail ? findThumbnail[1] : "";
                return { id: i, title, url, thumbnail, checked: false, cat: cat[cat.length - 1].innerText, lessons: lessons.join(', ') };
            });
        });
        await page.close()
        wsSend(ws, 'getCourses', 1, getEachCourse)
        ws.terminate()
    } catch (error) {
        wsSend(ws, 'getCourses', 3, error.message)
    }

}

export async function GetSelectedLesson(ws, data, req) {
    try {
        const selectedCourses = data.selected;
        if (selectedCourses?.length > 0) {
            for (let i = 0; i < selectedCourses.length; i++) {
                const page = await browserSession.createPage()
                wsSend(ws, 'getSelectedLesson', 2, `waiting for : ${selectedCourses[i].title}`)
                await page.goto(selectedCourses[i].url, { waitUntil: "networkidle0" });
                wsSend(ws, 'getSelectedLesson', 2, `get each lesson url from: ${selectedCourses[i].title}`)
                const lessonUrl = await page.$$eval("a.title", (el) =>
                    el.map((e, i) => {
                        return { url: e.getAttribute("href"), titleLesson: e.innerText };
                    })
                );
                Object.assign(selectedCourses[i], { urls: lessonUrl.slice() });
                await page.close()
                wsSend(ws, 'getSelectedLesson', 2, `success get each lesson from: ${selectedCourses[i].title}`)
            }
            wsSend(ws, 'getSelectedLesson', 1, selectedCourses)
        } else {
            wsSend(ws, 'error', 0, 'select atleast one course')
        }
    } catch (error) {
        console.log(error)
        wsSend(ws, 'error', 3, error.message)
        if (error.message.includes('timeout')) {
            wsSend(ws, 'error', 3, 'timeout retry scraping')
            await GetSelectedLesson(ws, data, req)
        }
    }
}

export async function GetVideoLesson(ws, data, req) {
    let index = 0
    const maxRetry = 3
    try {
        const lessons = data.videoLessons
        for (let i = 0; i < lessons.length; i++) {
            const videoUrls = [];
            for (let j = 0; j < lessons[i].urls.length; j++) {
                const page = await browserSession.createPage();
                wsSend(ws, 'getEachVideo', 2, `waiting for scraping video from: ${lessons[i].urls[j].titleLesson}`)
                await page.goto(lessons[i].urls[j].url, { waitUntil: "networkidle2" });
                wsSend(ws, 'getEachVideo', 2, `get url video from: ${lessons[i].urls[j].titleLesson}`)
                await page.waitForSelector('iframe', { timeout: 0 })
                const video = await page.$eval("iframe", (e) => e.getAttribute("src"));
                videoUrls.push(video);
                wsSend(ws, 'getEachVideo', 2, `success scrap video from: ${lessons[i].urls[j].titleLesson}`)
                await page.close()
            }
            Object.assign(lessons[i], { videoUrls })
            wsSend(ws, 'getEachVideo', 1, lessons)
        }
    } catch (error) {

        console.log(error.message)
        wsSend(ws, 'getEachVideo', 3, error.message)
        if (error.message.includes('timeout')) {
            if (index < maxRetry) {
                index++
                wsSend(ws, 'getEachVideo', 3, `timeout, retry scraping`)
                await GetVideoLesson(ws, data, req)
            } else {
                wsSend(ws, 'getEachVideo', 3, `already reach max retry, please check your internet connection & retry download from start`)
                ws.terminate()
            }
        }
    }
}