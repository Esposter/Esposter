import nuxtAssets from "#server/plugins/nuxtAssets";
import { describe, expect, test, vi } from "vitest";

const getResponseHook = () => {
  const hook = vi.fn();
  nuxtAssets({ hooks: { hook } } as never);
  const call = hook.mock.calls.find(([name]) => name === "response");
  return call?.[1] as (response: Response, event: { url: URL }) => void;
};

describe("nuxtAssets", () => {
  test("a missing file under the build's folder is not cached", () => {
    expect.hasAssertions();

    const response = new Response("", {
      headers: { "Cache-Control": "public, max-age=31536000, immutable" },
      status: 404,
    });
    getResponseHook()(response, { url: new URL("https://example.com/_nuxt/builds/meta/missing.json") });

    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  test("a file found under the build's folder stays immutable", () => {
    expect.hasAssertions();

    const cacheControl = "public, max-age=31536000, immutable";
    const response = new Response("", { headers: { "Cache-Control": cacheControl }, status: 200 });
    getResponseHook()(response, { url: new URL("https://example.com/_nuxt/entry.js") });

    expect(response.headers.get("Cache-Control")).toBe(cacheControl);
  });

  test("a missing page outside the build's folder keeps its own header", () => {
    expect.hasAssertions();

    const response = new Response("", { headers: { "Cache-Control": "public" }, status: 404 });
    getResponseHook()(response, { url: new URL("https://example.com/missing") });

    expect(response.headers.get("Cache-Control")).toBe("public");
  });
});
