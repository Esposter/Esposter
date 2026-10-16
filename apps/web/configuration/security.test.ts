import { afterEach, describe, expect, test, vi } from "vitest";

describe("security", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test("holds the hosts the app's fetches and media need", async () => {
    expect.hasAssertions();

    vi.stubEnv("AZURE_CONTAINER_BASE_URL", "https://container.blob.core.windows.net");
    vi.stubEnv("LIVEKIT_URL", "wss://livekit.example.cloud");
    vi.resetModules();
    const { security } = await import("./security.ts");

    const contentSecurityPolicy = security?.headers ? security.headers.contentSecurityPolicy || undefined : undefined;

    expect(contentSecurityPolicy?.["connect-src"]).toStrictEqual(
      expect.arrayContaining([
        "'self'",
        "data:",
        "blob:",
        "https://container.blob.core.windows.net",
        "wss://livekit.example.cloud",
        "https://livekit.example.cloud",
        "wss://*.webpubsub.azure.com",
        "https://cdn.jsdelivr.net",
      ]),
    );
    expect(contentSecurityPolicy?.["media-src"]).toStrictEqual(
      expect.arrayContaining(["'self'", "https://container.blob.core.windows.net", "blob:"]),
    );
  });

  test("writes no unset host into a source list", async () => {
    expect.hasAssertions();

    vi.stubEnv("AZURE_CONTAINER_BASE_URL", undefined);
    vi.stubEnv("LIVEKIT_URL", undefined);
    vi.resetModules();
    const { security } = await import("./security.ts");

    const contentSecurityPolicy = security?.headers ? security.headers.contentSecurityPolicy || undefined : undefined;

    expect(contentSecurityPolicy?.["connect-src"]).toStrictEqual([
      "'self'",
      "data:",
      "blob:",
      "wss://*.webpubsub.azure.com",
      "https://cdn.jsdelivr.net",
      "https://storage.googleapis.com",
    ]);
    expect(contentSecurityPolicy?.["media-src"]).toStrictEqual(["'self'", "blob:"]);
  });
});
