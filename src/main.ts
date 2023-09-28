import memfs from "memfs";
import { runNpmCli } from "npm-in-browser";

const outputElm = document.getElementById("output")!;

await runNpmCli(
  location.hash === "#proxy"
    ? [
        "install",
        "--registry=http://localhost:8745",
        `this-pkg-does-not-exist-${(Math.random() * 1e16).toFixed(0)}`,
      ]
    : [
        "install",
        `this-pkg-does-not-exist-${(Math.random() * 1e16).toFixed(0)}`,
      ],
  {
    fs: memfs.fs,
    cwd: "/home/web/app",
    stdout: (chunk) => {
      outputElm.textContent += chunk;
    },
    stderr: (chunk) => {
      outputElm.textContent += chunk;
    },
    timings: {
      start(name) {
        console.log("START: " + name);
      },
      end(name) {
        console.log("END: " + name);
      },
    },
  },
);
