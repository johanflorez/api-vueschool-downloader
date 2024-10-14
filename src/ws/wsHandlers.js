import wsSend from "../helper/wsSend.js"

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
            wsSend(socket, 'error', 3, 'type not found')
        }
    } catch (error) {
        wsSend(socket, 'error', 3, 'data send is not JSON')
    }
}

