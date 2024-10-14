export default function (ws, type, status, msg) {
    const statusCode = {
        0: 'failed',
        1: 'success',
        2: 'loading',
        3: 'error'
    }
    if (status in statusCode) {
        return ws.send(JSON.stringify({ type: type, status: statusCode[status], msg: msg }))
    }
}