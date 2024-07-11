
export function responseBody(code, res, data) {
    res.writeHead(code, { 'Content-type': 'application/json' })
    res.end(data.toString())
}

