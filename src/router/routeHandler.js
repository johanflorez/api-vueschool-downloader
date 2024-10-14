
const routes = []
function addRoute(method, path, ...handlers) {
    routes.push({ method, path, handlers })
}

function routeHandler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Max-Age', '86400');

    // Handle preflight request
    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

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