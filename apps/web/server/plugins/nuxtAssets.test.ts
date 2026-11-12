import nuxtAssets from "#server/plugins/nuxtAssets";
import { assert, describe, expect, test, vi } from "vitest";

type ResponseHook = (response: Response, event: { req: { url: string } }) => void;

const getResponseHook = async () => {
  const hook = vi.fn<(name: string, handler: ResponseHook) => void>();
  await nuxtAssets({ hooks: { hook } } as never);
  const call = hook.mock.calls.find(([name]) => name === "response");
  assert.exists(call);
  return call[1];
};

describe("nuxtAssets", () => {
  test("a missing file under the build's folder is not cached", async () => {
    expect.hasAssertions();

    const response = new Response("", {
      headers: { "Cache-Control": "public, max-age=31536000, immutable" },
      status: 404,
    });
    (await getResponseHook())(response, { req: { url: "https://example.com/_nuxt/builds/meta/missing.json" } });

    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  test("a file found under the build's folder stays immutable", async () => {
    expect.hasAssertions();

    const cacheControl = "public, max-age=31536000, immutable";
    const response = new Response("", { headers: { "Cache-Control": cacheControl }, status: 200 });
    (await getResponseHook())(response, { req: { url: "https://example.com/_nuxt/entry.js" } });

    expect(response.headers.get("Cache-Control")).toBe(cacheControl);
  });

  test("a missing page outside the build's folder keeps its own header", async () => {
    expect.hasAssertions();

    const response = new Response("", { headers: { "Cache-Control": "public" }, status: 404 });
    (await getResponseHook())(response, { req: { url: "https://example.com/missing" } });

    expect(response.headers.get("Cache-Control")).toBe("public");
  });
});
