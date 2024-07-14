export default function setupWS(ws) {
    ws.on('connection', (socket, req) => {
        console.log('client connect')
        console.log('client ip', req.socket.remoteAddress)
        socket.on('error', console.error)
        socket.on('message', (data) => {
            console.log('message received %s', data)
            socket.send('success sending message to server')
        })

        socket.on('close', (msg) => {
            console.log('client closed connection', msg)
        })
    })
    ws.on('close', () => {
        console.log('server socket closed')
    })
}