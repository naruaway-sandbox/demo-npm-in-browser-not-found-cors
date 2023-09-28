import httpProxy from "http-proxy";
import http from "node:http";

const proxy = httpProxy.createProxyServer({});

proxy.on("proxyRes", function (proxyRes) {
  proxyRes.headers["access-control-allow-origin"] = "*";
});

const server = http.createServer((req, res) => {
  console.log(`proxying ${req.url}`);
  proxy.web(req, res, {
    target: "https://registry.npmjs.org",
    changeOrigin: true,
  });
});

const port = 8745;
server.listen(port);
console.log(`proxy server listening on port ${port}`);
