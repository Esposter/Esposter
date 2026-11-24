import nuxtAssets from "#server/plugins/nuxtAssets";
import { H3Event } from "nitro/h3";
import { createRouteRulesPlugin } from "nuxt-security-module/runtime/nitro/plugins/routeRules";
import { assert, beforeEach, describe, expect, test, vi } from "vitest";

type ResponseHook = (response: Response, event: H3Event) => void;

const createEvent = (url: string) => new H3Event(new Request(url));

const getResponseHook = async (): Promise<ResponseHook> => {
  const hook = vi.fn<(name: string, handler: ResponseHook) => void>();
  await nuxtAssets({ hooks: { hook } } as never);
  const call = hook.mock.calls.find(([name]) => name === "response");
  assert.exists(call);
  return call[1];
};

describe("nuxtAssets", () => {
  // The module's route rules, resolved the way its Nitro plugin resolves them on the first request. Each header is a
  // Value the module's defaults do not set, so a value the hook writes itself cannot match them by chance
  beforeEach(async () => {
    let resolveRoutes: (() => Promise<void>) | undefined;
    const routeRulesPlugin = createRouteRulesPlugin({
      "/**": {
        headers: {
          contentSecurityPolicy: { "default-src": ["'self'"] },
          crossOriginEmbedderPolicy: "unsafe-none",
          crossOriginOpenerPolicy: "same-origin",
          referrerPolicy: "strict-origin",
          strictTransportSecurity: { includeSubdomains: true, maxAge: 31536000, preload: false },
          xContentTypeOptions: "nosniff",
          xFrameOptions: "SAMEORIGIN",
          xPermittedCrossDomainPolicies: "master-only",
        },
      },
    });
    await routeRulesPlugin({
      hooks: {
        callHook: () => Promise.resolve(),
        hook: (_name: string, handler: () => Promise<void>) => {
          resolveRoutes = handler;
        },
      },
    } as unknown as Parameters<typeof routeRulesPlugin>[0]);
    await resolveRoutes?.();
  });

  test("a missing file under the build's folder is not cached", async () => {
    expect.hasAssertions();

    const response = new Response("", {
      headers: { "Cache-Control": "public, max-age=31536000, immutable" },
      status: 404,
    });
    (await getResponseHook())(response, createEvent("https://example.com/_nuxt/builds/meta/missing.json"));

    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  // A response the Worker writes under the build's folder gets none of its file's headers, so it takes the resource
  // Headers the page's rules set and the embedder policy its pages send, and none of the page-only policies
  test("a missing file under the build's folder carries the resource headers its rules set, and no page-only policy", async () => {
    expect.hasAssertions();

    const response = new Response(null, { status: 404 });
    (await getResponseHook())(response, createEvent("https://example.com/_nuxt/missing.js"));

    expect(Object.fromEntries(response.headers)).toStrictEqual({
      "cache-control": "no-store",
      "cross-origin-embedder-policy": "unsafe-none",
      "referrer-policy": "strict-origin",
      "strict-transport-security": "max-age=31536000; includeSubDomains",
      "x-content-type-options": "nosniff",
      "x-frame-options": "SAMEORIGIN",
      "x-permitted-cross-domain-policies": "master-only",
    });
  });

  test("a file found under the build's folder stays immutable", async () => {
    expect.hasAssertions();

    const cacheControl = "public, max-age=31536000, immutable";
    const response = new Response("", { headers: { "Cache-Control": cacheControl }, status: 200 });
    (await getResponseHook())(response, createEvent("https://example.com/_nuxt/entry.js"));

    expect(response.headers.get("Cache-Control")).toBe(cacheControl);
  });

  test("a missing page outside the build's folder keeps its own header", async () => {
    expect.hasAssertions();

    const response = new Response("", { headers: { "Cache-Control": "public" }, status: 404 });
    (await getResponseHook())(response, createEvent("https://example.com/missing"));

    expect(response.headers.get("Cache-Control")).toBe("public");
  });
});
