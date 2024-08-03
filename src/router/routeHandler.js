const routes = []
function addRoute(method, path, ...handlers) {
    routes.push({ method, path, handlers })
}

function routeHandler(req, res) {
    const route = routes.find(r =>
        r.method === req.method && r.path === req.url
    )
    let index = 0

    if (route) {
        const next = () => {
            if (index < route.handlers.length) {
                route.handlers[index++](req, res, next)
            }
        }
        next()
    } else {
        res.writeHeader(404, { 'Content-type': 'application/json' })
        res.end('Not Found')
    }

}

export { routes, addRoute, routeHandler }