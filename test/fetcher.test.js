import { EventEmitter } from "node:events";
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { fetchFile } from "../lib/fetcher.js";

function fakeResponse({ statusCode, headers = {}, body = "" }) {
  const res = new EventEmitter();
  res.statusCode = statusCode;
  res.headers = headers;
  res.resume = () => {};
  res.setEncoding = () => {};
  // Emitted after fetchFile has attached its listeners in the get callback.
  queueMicrotask(() => {
    if (body) {
      res.emit("data", body);
    }
    res.emit("end");
  });
  return res;
}

function stubGet(respond) {
  const requested = [];
  const get = (url, callback) => {
    requested.push(url);
    const req = new EventEmitter();
    queueMicrotask(() => callback(respond(url, requested.length)));
    return req;
  };
  return { get, requested };
}

describe("fetcher", () => {
  it("stops following redirects once the limit is exhausted", async () => {
    const { get, requested } = stubGet((url, attempt) =>
      fakeResponse({ statusCode: 302, headers: { location: `/loop-${attempt}` } })
    );

    await assert.rejects(fetchFile("https://example.test/start", { get }), /Too many redirects/);
    // One initial request plus the five allowed redirects.
    assert.equal(requested.length, 6);
  });

  it("follows a redirect and resolves the final body", async () => {
    const { get, requested } = stubGet((url, attempt) =>
      attempt === 1
        ? fakeResponse({ statusCode: 302, headers: { location: "/final.md" } })
        : fakeResponse({ statusCode: 200, body: "# final" })
    );

    assert.equal(await fetchFile("https://example.test/start", { get }), "# final");
    assert.deepEqual(requested, ["https://example.test/start", "https://example.test/final.md"]);
  });

  it("rejects a non-200 response", async () => {
    const { get } = stubGet(() => fakeResponse({ statusCode: 404 }));

    await assert.rejects(fetchFile("https://example.test/missing", { get }), /HTTP 404/);
  });

  it("rejects when the request itself errors", async () => {
    const get = (url, callback) => {
      const req = new EventEmitter();
      queueMicrotask(() => req.emit("error", new Error("socket hang up")));
      return req;
    };

    await assert.rejects(fetchFile("https://example.test/start", { get }), /socket hang up/);
  });
});
