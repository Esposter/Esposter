import { afterEach, describe, expect, test, vi } from "vitest";
import { FilterXSS } from "xss";

// An XSS validator that rejects a request whose serialized body its `FilterXSS` would change, with the options it
// Builds: `escapeHtml` left to the default, or replaced by the identity when configured off. This is the measurement
// The module's decision not to build one rests on (`apps/web/content/docs/nuxt-security-module/upstream.md`)
const checkIsRejected = (filterXSS: FilterXSS, value: string) =>
  filterXSS.process(JSON.stringify({ value })) !== JSON.stringify({ value });

describe("xssValidator", () => {
  test.each([
    ["a heart", "i <3 you"],
    ["a comparison", "a < b"],
    ["a password", "<"],
    ["a mention", '<span data-type="mention"></span>'],
  ])("rejects %s under its default options", (_description, value) => {
    expect.hasAssertions();

    expect(checkIsRejected(new FilterXSS(), value)).toBe(true);
  });

  test("passes a script with escapeHtml off", () => {
    expect.hasAssertions();

    expect(checkIsRejected(new FilterXSS({ escapeHtml: (html) => html }), "<script></script>")).toBe(false);
  });
});

describe("security", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test("holds the hosts the app's fetches and media need", async () => {
    expect.hasAssertions();

    vi.stubEnv("AZURE_CONTAINER_BASE_URL", "https://esposter.blob.core.windows.net");
    vi.stubEnv("LIVEKIT_URL", "wss://esposter.livekit.cloud");
    vi.resetModules();
    const { security } = await import("./security.ts");

    expect(security?.headers).toMatchObject({
      contentSecurityPolicy: {
        "connect-src": expect.arrayContaining([
          "'self'",
          "https://esposter.blob.core.windows.net",
          "wss://esposter.livekit.cloud",
          "https://esposter.livekit.cloud",
          "wss://*.webpubsub.azure.com",
          "https://cdn.jsdelivr.net",
        ]),
        "media-src": expect.arrayContaining(["'self'", "https://esposter.blob.core.windows.net", "blob:"]),
      },
    });
  });
});
