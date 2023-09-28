# demo-npm-in-browser-not-found-cors

Since `registry.npmjs.org` has CORS headers (https://github.com/npm/feedback/discussions/117), we can make npm CLI work inside browser without relying on 3rd party server side.

I built [npm-in-browser](https://github.com/naruaway/npm-in-browser) to realize this.

However, I found that in some cases `registry.npmjs.org` does not return CORS headers appropriately, which makes npm-in-browser behave differently than real npm CLI in local machine.

## The issue

Although fetching `https://registry.npmjs.org/react` in browser returns with `Access-Control-Allow-Origin: *` response header, fetching `https://registry.npmjs.org/this-pkg-does-not-exist-1234567` does not return that CORS header.
Because of this, fetch inside npm-in-browser fails with `TypeError: Failed to fetch` error due to the CORS violation. npm-in-browser cannot know whether this was a real network failure or it is failing because the package does not exist.

This repo includes code to reproduce the issue and I confirmed that if `registry.npmjs.org` always returns `Access-Control-Allow-Origin: *` even for "404 Not Found" response, "npm-in-browser" behaves identically with the npm CLI in local machines for non-existent npm packages.

### How to run the reproduction

After running `npm ci` in this repo, you should run both `npm run dev` and `npm run proxy` in separate terminals.
`npm run proxy` runs a proxy server to proxy `registry.npmjs.org` to always add `Access-Control-Allow-Origin: *` in the response.

Then you can visit the URL shown in `npm run dev` terminal without or with `#proxy` URL hash, which adds `--registry=http://localhost:8745` to the npm install option to use the proxy.
You can check and modify src/main.ts for more details of parameter handling.

#### Without proxy

Without using the proxy, npm-in-browser directly connects to `registry.npmjs.org`.
As explained above, it shows `Failed to fetch` although what is happening under the hood is CORS error.

```
npm ERR! Failed to fetch

npm ERR! A complete log of this run can be found in: /home/web/.npm/_logs/2023-09-28T05_07_54_094Z-debug-0.log
```

#### With proxy

With the proxy, CORS error does not happen and we see the clear message from npm-in-browser indicating that the package does not exist.

```
npm ERR! code E404
npm ERR! 404 Not Found - GET http://localhost:8745/this-pkg-does-not-exist-6820863782039188 - Not found
npm ERR! 404
npm ERR! 404  'this-pkg-does-not-exist-6820863782039188@*' is not in this registry.
npm ERR! 404
npm ERR! 404 Note that you can also install from a
npm ERR! 404 tarball, folder, http url, or git url.

npm ERR! A complete log of this run can be found in: /home/web/.npm/_logs/2023-09-28T05_07_19_717Z-debug-0.log
```

## Potential solution

Ideally `registry.npmjs.org` should make sure to return CORS headers even for "404 Not Found" response (also for other status code such as "500 error" but it's less relevant).
