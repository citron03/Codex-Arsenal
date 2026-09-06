import https from "node:https";

const REDIRECT_CODES = new Set([301, 302, 303, 307, 308]);
const MAX_REDIRECTS = 5;

export function fetchFile(url, opts = {}) {
  const get = opts.get || https.get;
  const redirectsLeft = opts.redirectsLeft ?? MAX_REDIRECTS;

  return new Promise((resolve, reject) => {
    get(url, (res) => {
      if (REDIRECT_CODES.has(res.statusCode) && res.headers.location) {
        res.resume();
        if (redirectsLeft <= 0) {
          reject(new Error(`Too many redirects for ${url}`));
          return;
        }
        const nextUrl = new URL(res.headers.location, url).toString();
        fetchFile(nextUrl, { get, redirectsLeft: redirectsLeft - 1 }).then(resolve, reject);
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
    }).on("error", reject);
  });
}
