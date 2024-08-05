import * as browserSession from "./PuppeteerController.js"
import fs from "fs"

const coursesUrl = "https://vueschool.io/courses"
export async function GetCourses(ws, data, req) {
    try {
        const cookies = req.cookies
        const page = await browserSession.createPage()
        await page.goto(coursesUrl, { waitUntil: "networkidle0" });
        ws.send("set cookies on page")
        await page.setCookie(...cookies)
        ws.send("trying to scrap all courses")
        const getEachCourse = await page.$$eval("a.thumb-card", (el) => {
            return el.map((e, i) => {
                const title = e.querySelector("h3.text-xl").innerText;
                const url = e.getAttribute("href");
                const regex = /\(\"(.*?)\"\)/;
                const findThumbnail = e
                    .querySelector("div.thumbnail")
                    .getAttribute("style")
                    .match(regex);
                const thumbnail = findThumbnail ? findThumbnail[1] : "";
                return { id: i, title, url, thumbnail, checked: false };
            });
        });
        await page.close()
        ws.send(JSON.stringify(getEachCourse))
        ws.terminate()
    } catch (error) {
        ws.send(JSON.stringify({ type: "getCourses", msg: error.message }))
    }

}

export async function GetSelectedLesson(ws, data, req) {
    try {
        const selectedCourses = data.selected;
        if (selectedCourses?.length > 0) {
            for (let i = 0; i < selectedCourses.length; i++) {
                const page = await browserSession.createPage()
                ws.send(JSON.stringify({ type: "getCourses", status: "waiting for:", log: selectedCourses[i].url }));
                await page.goto(selectedCourses[i].url, { waitUntil: "networkidle0" });
                ws.send(JSON.stringify({ type: "getCourses", status: "get lesson each url from: ", log: selectedCourses[i].url }));
                const lessonUrl = await page.$$eval("a.title", (el) =>
                    el.map((e, i) => {
                        return e.getAttribute("href");
                    })
                );
                Object.assign(selectedCourses[i], { urls: lessonUrl.slice() });
                await page.close()
            }
            ws.send(JSON.stringify(selectedCourses));
            ws.terminate()
        } else {
            ws.send(JSON.stringify({ type: 'getSelectedCourses', msg: 'select atleast one course' }));
        }
    } catch (error) {
        console.log(error)
        ws.send(JSON.stringify({ type: "getSelectedLesson", error: error.message }))
        if (error.message.includes('timeout')) {
            ws.send(JSON.stringify({ type: 'getSelectedCourses', msg: 'timeout retry scraping' }))
            await GetSelectedLesson(ws, data, req)
        }
    }
}

export async function GetVideoLesson(ws, data, req) {
    let index = 0
    const maxRetry = 3
    try {
        const lessons = data.videoLessons
        const videoLesson = [];
        for (let i = 0; i < lessons.length; i++) {
            const videoUrls = [];
            for (let j = 0; j < lessons[i].urls.length; j++) {
                const page = await browserSession.createPage();
                ws.send(JSON.stringify({ type: 'getEachVide', msg: `waiting for scraping video from: ${lessons[i].urls[j]}` }));
                await page.goto(lessons[i].urls[j], { waitUntil: "networkidle2" });
                ws.send(JSON.stringify({ type: 'getEachVideo', msg: `get url video from: ${lessons[i].urls[j]}` }));
                await page.waitForSelector('iframe', { timeout: 0 })
                const video = await page.$eval("iframe", (e) => e.getAttribute("src"));
                videoUrls.push(video);
                ws.send(JSON.stringify({ type: 'getEachVideo', msg: `success scrap video from: ${lessons[i].urls[j]}` }))
                await page.close()
            }
            const newLesson = { ...lessons[i] };
            newLesson.videoUrls = videoUrls;
            videoLesson.push(newLesson);
            ws.send(JSON.stringify({ type: "getEachVideo", videosUrls: newLesson }))
        }
        ws.terminate()
    } catch (error) {

        console.log(error.message)
        ws.send(JSON.stringify({ type: "getEachVideo", error: error.message }))
        if (error.message.includes('timeout')) {
            if (index < maxRetry) {
                index++
                ws.send(JSON.stringify({ type: 'getEachVideo', msg: 'timeout, retry scraping' }))
                await GetVideoLesson(ws, data, req)
            } else {
                ws.send(JSON.stringify({ type: 'getEachVideo', msg: 'already reach max retry, please check your internet connection' }))
                ws.terminate()
            }
        }
    }
}