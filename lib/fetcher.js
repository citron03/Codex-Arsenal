import https from "node:https";

const REDIRECT_CODES = new Set([301, 302, 303, 307, 308]);
const MAX_REDIRECTS = 5;
// A hung connection would otherwise block an install indefinitely.
const TIMEOUT_MS = 15_000;

export function fetchFile(url, opts = {}) {
  const get = opts.get || https.get;
  const redirectsLeft = opts.redirectsLeft ?? MAX_REDIRECTS;
  const timeout = opts.timeout ?? TIMEOUT_MS;

  return new Promise((resolve, reject) => {
    const request = get(url, (res) => {
      if (REDIRECT_CODES.has(res.statusCode) && res.headers.location) {
        res.resume();
        if (redirectsLeft <= 0) {
          reject(new Error(`Too many redirects for ${url}`));
          return;
        }

        const nextUrl = new URL(res.headers.location, url);
        // Whatever this fetches is written into the caller's project, so a
        // redirect must not move the request to a host they did not ask for.
        if (nextUrl.host !== new URL(url).host) {
          reject(new Error(`Refusing to follow a redirect from ${new URL(url).host} to ${nextUrl.host}`));
          return;
        }

        fetchFile(nextUrl.toString(), { get, redirectsLeft: redirectsLeft - 1, timeout }).then(resolve, reject);
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
    });

    request.on("error", reject);
    request.setTimeout?.(timeout, () => {
      request.destroy(new Error(`Timed out after ${timeout}ms fetching ${url}`));
    });
  });
}
