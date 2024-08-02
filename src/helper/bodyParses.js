export default function bodyParser(req) {
    return new Promise((resolve, reject) => {
        let body = ''
        const contentType = req.headers['content-type']
        if (!contentType || !contentType.includes('application/json')) {
            reject(new Error('invalid request body type'))
            return
        }
        req.on('data', chunk => {
            body += chunk.toString()
        })
        req.on('end', () => {
            try {
                const bodyParsed = JSON.parse(body)
                resolve(bodyParsed)
            } catch (error) {
                reject(new Error('invalid json'))
            }
        })
        req.on('error', (error) => {
            reject(new Error(error))
        })
    })
}