import fs from "fs"
import { execFile } from 'node:child_process';
import wsSend from "../helper/wsSend.js";
const batchFile = 'batch.txt'
const libPath = './lib/'
export function createPath(data) {
    return new Promise((resolve, reject) => {
        const videosLesson = data.data
        const outputPath = "./output";
        const listPath = [];
        for (let i = 0; i < videosLesson.length; i++) {
            const slugTitle = videosLesson[i].title.replace(/[ *]/g, "-");
            const pathFile = `${outputPath}/${slugTitle}`;
            fs.mkdirSync(pathFile, { recursive: true });
            if (fs.existsSync(pathFile)) {
                fs.writeFileSync(
                    `${pathFile}/${batchFile}`,
                    String(videosLesson[i].videoUrls).replace(/[,]/g, "\n")
                );
                fs.writeFileSync(
                    `${pathFile}/output.json`,
                    JSON.stringify(videosLesson[i])
                );
                listPath.push(pathFile);
            } else {
                reject(new Error('failed create path'))
            }
        }
        resolve(listPath)
    })

}

export function downloader(ws, data, req, listPath) {
    return new Promise((resolve, reject) => {
        let currentIndex = 0
        function processNext() {
            if (currentIndex >= listPath.length) {
                resolve(wsSend(ws, 'downloader', 1, "download complete please check output folder"))
                return
            }

            if (fs.existsSync(`${listPath[currentIndex]}/${batchFile}`)) {
                const childProcess = execFile(`${libPath}yt-dlp.exe`, [
                    "--ffmpeg-location",
                    `${libPath}ffmpeg.exe`,
                    "--refer",
                    "https://vueschool.io/",
                    "-f",
                    "`bv+ba`",
                    "--batch-file",
                    `${listPath[currentIndex]}/${batchFile}`,
                    "--paths",
                    `${listPath[currentIndex]}/video`
                ]);
                childProcess.stdout.on("data", (data) => {
                    ws.send(JSON.stringify({ type: "downloader", log: data }))
                });
                childProcess.stderr.on("data", (data) => {
                    ws.send(JSON.stringify({ type: "downloader", log: data }))
                });
                childProcess.on("error", (err) => {
                    ws.send(JSON.stringify({ type: "downloader", msg: err }))
                    currentIndex++
                    processNext()
                });
                childProcess.on('close', (code) => {
                    if (code !== 0) {
                        reject(wsSend(ws, 'downloader', 3, `exit with error code ${code}`))
                    } else {
                        wsSend(ws, 'downloader', 2, `Download complete for ${listPath[currentIndex]}`)
                    }
                    currentIndex++
                    processNext()
                })
            } else {
                wsSend(ws, 'downloader', 3, `Batch file not found in ${listPath[currentIndex]}`)
                currentIndex++
                processNext()
            }
        }
        processNext()
    })
}


export async function downloaderRunner(ws, data, req) {
    try {
        const listPath = await createPath(data)
        wsSend(ws, 'downloader', 2, 'success, get all video url, trying downloading video, please wait...')
        await downloader(ws, data, req, listPath)
    } catch (error) {
        console.log(error)
        wsSend(ws, 'downloader', 3, error.message)
    }
}