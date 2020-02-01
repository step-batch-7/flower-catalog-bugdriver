const getMatchingRoutes = function(routes, req) {
  return routes.filter(route => {
    if (route.method)
      return req.method == route.method && req.url.match(route.url);
    return true;
  });
};

class App {
  constructor() {
    this.routes = [];
  }
  get(url, handler) {
    this.routes.push({ url, handler, method: 'GET' });
  }
  post(url, handler) {
    this.routes.push({ url, handler, method: 'POST' });
  }
  use(middlerWare) {
    this.routes.push({ handler: middlerWare });
  }
  serve(req, res) {
    req.setEncoding('utf8');
    const matchingHandlers = getMatchingRoutes(this.routes, req);
    const next = function() {
      if (matchingHandlers.length === 0) return;
      const router = matchingHandlers.shift();
      router.handler(req, res, next);
    };
    next();
  }
}

module.exports = { App };
