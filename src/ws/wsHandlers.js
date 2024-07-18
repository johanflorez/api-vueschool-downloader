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

