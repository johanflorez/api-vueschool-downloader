const routes = {}
function addRoute(method, path, handler) {
    if (!routes[method]) {
        routes[method] = {}
    }
    routes[method][path] = handler
}

function routeHandler(req, res) {
    const method = req.method
    const url = req.url

    if (routes[method] && routes[method][url]) {
        return routes[method][url](req, res)
    }

    res.writeHeader(404, { 'Content-type': 'application/json' })
    res.end('Not Found')
}

export { routes, addRoute, routeHandler }