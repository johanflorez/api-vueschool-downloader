export default async function bodyParser(req) {
    let body = ''
    const contentType = req.headers['content-type']
    if (!contentType || !contentType.includes('application/json')) {
        throw new Error('invalid request body type')
    }
    return new Promise((resolve, reject) => {
        req.on('data', data => {
            body += data
        })
        req.on('end', () => {
            try {
                resolve(JSON.parse(body))
            } catch (error) {
                reject(new Error('invalid json'))
            }
        })
        req.on('error', (error) => {
            reject(new Error(error))
        })
    })
}