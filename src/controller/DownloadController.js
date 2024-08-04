import fs from "fs"
import { execFile } from 'node:child_process';
const batchFile = 'batch.txt'
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
                resolve(ws.send(JSON.stringify({ type: "downloader", msg: "download complete please check output folder" })))
                return
            }

            if (fs.existsSync(`${listPath[currentIndex]}/${batchFile}`)) {
                const childProcess = execFile("./yt-dlp.exe", [
                    "--refer",
                    "https://vueschool.io/",
                    "--batch-file",
                    `${listPath[currentIndex]}/${batchFile}`,
                    "--paths",
                    `${listPath[currentIndex]}/video`,
                    "-f bv*"
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
                        reject(ws.send(JSON.stringify({ type: "downloader", msg: "exit with error code " + code })))
                    } else {
                        ws.send(JSON.stringify({ type: "downloader", msg: `Download complete for ${listPath[currentIndex]}` }));
                    }
                    currentIndex++
                    processNext()
                })
            } else {
                ws.send(JSON.stringify({ type: "downloader", msg: `Batch file not found in ${listPath[currentIndex]}` }));
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
        await downloader(ws, data, req, listPath)
    } catch (error) {
        console.log(error)
        ws.send(JSON.stringify({ type: "downloader", error: error.message }))
    }
}