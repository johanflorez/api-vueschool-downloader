import * as browserSession from "./PuppeteerController.js"

async function getAuthh(socket, data, req) {
    try {
        let getAuth = readFileSync("./cookies.txt");
        cookies = JSON.parse(getAuth);
        socket.send("cookies found!");
        return cookies
    } catch (error) {
        socket.send('cookies not found in local try to re-login')
    }
}

export async function GetCourses(socket, data, req) {
    try {
        const cookies = await getAuthh(socket, data, req)

    } catch (error) {

    }

}

export async function GetSelectonLesson(socket, data, req) {

}

export async function GetVideoLesson(socket, data, req) {

}