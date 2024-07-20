import * as browserSession from "./PuppeteerController.js"
import fs from "fs"

const coursesUrl = "https://vueschool.io/courses"
async function getAuthh(socket, data, req) {
    try {
        let getAuth = fs.readFileSync("./cookies.txt");
        const cookies = JSON.parse(getAuth);
        socket.send("cookies found!");
        return cookies
    } catch (error) {
        socket.send(error.message)
    }
}

export async function GetCourses(socket, data, req) {
    try {
        const cookies = await getAuthh(socket, data, req)
        const page = await browserSession.createPage()
        await page.goto(coursesUrl, { waitUntil: "networkidle2" });
        socket.send("set cookies on page")
        await page.setCookie(...cookies)
        socket.send("trying to scrap all courses")
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
        socket.send(JSON.stringify(getEachCourse))
        socket.terminate()
    } catch (error) {
        socket.send(JSON.stringify({ type: "getCourses", msg: error.message }))
    }

}

export async function GetSelectonLesson(socket, data, req) {
    try {
        const courses = data.courses
        const selected = data.selected
        const selectedCourses = courses.filter((e) => selected.includes(e.id));
        for (let i = 0; i < selectedCourses.length; i++) {
            const page = await browserSession.createPage()
            socket.send(JSON.stringify({ type: "getCourses", status: "waiting for:", log: selectedCourses[i].url }));
            await page.goto(selectedCourses[i].url, { waitUntil: "networkidle2" });
            socket.send({ type: "getCourses", status: "get url from: ", log: selectedCourses[i].url });
            const lessonUrl = await page.$$eval("a.title", (el) =>
                el.map((e, i) => {
                    return e.getAttribute("href");
                })
            );
            Object.assign(selectedCourses[i], { urls: lessonUrl.slice() });
        }
        socket.send(JSON.stringify(selectedCourses));
        socket.terminate()
    } catch (error) {
        socket.send(error.message)
        console.log(error)
    }
}

export async function GetVideoLesson(socket, data, req) {

}