import https from "node:https";

const REDIRECT_CODES = new Set([301, 302, 303, 307, 308]);

export function fetchFile(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (REDIRECT_CODES.has(res.statusCode) && res.headers.location) {
          const nextUrl = new URL(res.headers.location, url).toString();
          res.resume();
          fetchFile(nextUrl).then(resolve, reject);
          return;
        }

        if (res.statusCode !== 200) {
          res.resume();
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          return;
        }

        res.setEncoding("utf8");
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => resolve(data));
      })
      .on("error", reject);
  });
}
