
export function responseBody(code, res, data) {
    res.writeHead(code, { 'Content-type': 'application/json' })
    if (code == 200) {
        res.end(JSON.stringify({
            status: code,
            data: data
        }))
    } else {
        res.end(JSON.stringify({
            status: code,
            message: data
        }))
    }
}

