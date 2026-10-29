import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { afterEach, describe, expect, test, vi } from "vitest";

import { NUXT_IMAGE_ERROR_HANDLER } from "./constants.ts";

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

  // The page blocks an inline handler its policy does not list, so the one NuxtImg renders is allowed by the hash of its
  // Exact text and nothing else
  test("allows the image error handler by its hash and no other inline handler", async () => {
    expect.hasAssertions();

    vi.resetModules();
    const { security } = await import("./security.ts");

    const contentSecurityPolicy = security?.headers ? security.headers.contentSecurityPolicy || undefined : undefined;
    const hash = createHash("sha256").update(NUXT_IMAGE_ERROR_HANDLER).digest("base64");

    expect(contentSecurityPolicy?.["script-src-attr"]).toStrictEqual(["'unsafe-hashes'", `'sha256-${hash}'`]);
  });

  // An upgrade that rewords the handler would leave the hash allowing nothing, and every image would log a violation
  test("the image module still renders the handler the policy allows", () => {
    expect.hasAssertions();

    const componentDirectory = join(
      dirname(createRequire(import.meta.url).resolve("@nuxt/image")),
      "runtime/components",
    );

    for (const component of ["NuxtImg", "NuxtPicture"])
      expect(readFileSync(join(componentDirectory, `${component}.vue`), "utf8")).toContain(NUXT_IMAGE_ERROR_HANDLER);
  });
});
