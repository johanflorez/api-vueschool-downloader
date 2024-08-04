const handlers = []

export function RegisterWsHandler(type, ...handler) {

    handlers.push({ type, handler })
}
export function wsHandlers(socket, msg, req) {
    try {
        let index = 0
        const data = JSON.parse(msg)
        const handler = handlers.find((r) => r.type === data.type)
        if (handler) {
            const next = () => {
                if (index < handler.handler.length) {
                    handler.handler[index++](socket, data, req, next)
                }
            }
            next()
        } else {
            socket.send(JSON.stringify({ type: 'error', msg: 'type not found' }))
        }
    } catch (error) {
        socket.send(JSON.stringify({ type: 'error', msg: 'data send is not JSON' }))
    }
}

