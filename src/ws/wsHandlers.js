/* websocket type list 
login browser
{"type": "login",}

get all courses
{"type":"getCourses", "data": cookies}

get selected courses
{
"type":"getSelectedCourses", 
"selected": [{id,title, url, thumbnail, checked: false}]
}

get each video lesson
{
"type":"getEachVideo",
"data":[{id, title, url, thumbnail, checked: true, urls}]
}

downloader
{
"type":"downloader",
"data":[{id, title, thumbnail, checked: true, urls, videosulrs[]}]
}
*/

const handlers = {}

export function RegisterWsHandler(type, handler) {
    if (!handlers[type]) {
        handlers[type] = {}
    }
    handlers[type] = handler
}
export function wsHandlers(socket, msg, req) {
    try {
        const data = JSON.parse(msg)
        if (handlers[data.type]) {
            return handlers[data.type](socket, data, req)
        }
        socket.send(JSON.stringify({ type: 'error', msg: 'type not found' }))
    } catch (error) {
        socket.send(JSON.stringify({ type: 'error', msg: 'data send type not JSON' }))
    }

}

