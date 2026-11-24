import { CLOUDFLARE_INSIGHTS_URL, NUXT_IMAGE_ERROR_HANDLER } from "#configuration/constants";
import { IMMUTABLE_CACHE_CONTROL, routeRules } from "#configuration/routeRules";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { afterEach, describe, expect, test, vi } from "vitest";

import { CloudflareEnvironment } from "../../../packages/db-schema/src/models/cloudflare/CloudflareEnvironment.ts";
import { CLOUDFLARE_ACCOUNT_ID } from "../../../packages/db-schema/src/services/cloudflare/constants.ts";
import { HostedAssetOriginMap } from "../../../packages/db-schema/src/services/storage/HostedAssetOriginMap.ts";

describe("security", () => {
  const hostedOrigin = HostedAssetOriginMap[CloudflareEnvironment.Production];
  const hostedDevOrigin = HostedAssetOriginMap[CloudflareEnvironment.Development];

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  // The app frames no page of its own by address: the page builder's canvas and the previews are `srcdoc` frames, which
  // Carry no response for either header to refuse
  test("lets no page frame the app", async () => {
    expect.hasAssertions();

    vi.resetModules();
    const { security } = await import("#configuration/security");

    const contentSecurityPolicy = security?.headers ? security.headers.contentSecurityPolicy || undefined : undefined;

    expect(contentSecurityPolicy?.["frame-ancestors"]).toStrictEqual(["'none'"]);
    expect(security?.headers ? security.headers.xFrameOptions : undefined).toBe("DENY");
  });

  test("holds the hosts the app's fetches and media need", async () => {
    expect.hasAssertions();

    vi.stubEnv("PUBLIC_ASSETS_BASE_URL", "https://assets.esposter.com");
    vi.resetModules();
    const { security } = await import("#configuration/security");

    const contentSecurityPolicy = security?.headers ? security.headers.contentSecurityPolicy || undefined : undefined;

    expect(contentSecurityPolicy?.["connect-src"]).toStrictEqual(
      expect.arrayContaining([
        "'self'",
        "data:",
        "blob:",
        "https://assets.esposter.com",
        `https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        "https://*.realtime.cloudflare.com",
        "wss://*.realtime.cloudflare.com",
        hostedOrigin,
      ]),
    );
    expect(contentSecurityPolicy?.["media-src"]).toStrictEqual(
      expect.arrayContaining([
        "'self'",
        `https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        "https://assets.esposter.com",
        hostedOrigin,
        "blob:",
      ]),
    );
    expect(contentSecurityPolicy?.["font-src"]).toStrictEqual(["'self'", hostedOrigin]);
  });

  test("lists the development hosts in a development build", async () => {
    expect.hasAssertions();

    vi.stubEnv("CLOUDFLARE_ENV", CloudflareEnvironment.Development);
    vi.resetModules();
    const { security } = await import("#configuration/security");

    const contentSecurityPolicy = security?.headers ? security.headers.contentSecurityPolicy || undefined : undefined;

    expect(contentSecurityPolicy?.["connect-src"]).toStrictEqual(expect.arrayContaining([hostedDevOrigin]));
    expect(contentSecurityPolicy?.["font-src"]).toStrictEqual(["'self'", hostedDevOrigin]);
  });

  test("writes no unset host into a source list", async () => {
    expect.hasAssertions();

    vi.stubEnv("PUBLIC_ASSETS_BASE_URL", undefined);
    vi.resetModules();
    const { security } = await import("#configuration/security");

    const contentSecurityPolicy = security?.headers ? security.headers.contentSecurityPolicy || undefined : undefined;

    expect(contentSecurityPolicy?.["connect-src"]).toStrictEqual([
      "'self'",
      "data:",
      "blob:",
      `https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      hostedOrigin,
      "https://*.realtime.cloudflare.com",
      "wss://*.realtime.cloudflare.com",
      CLOUDFLARE_INSIGHTS_URL,
    ]);
    expect(contentSecurityPolicy?.["media-src"]).toStrictEqual([
      "'self'",
      `https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      hostedOrigin,
      "blob:",
    ]);
  });

  // The page blocks an inline handler its policy does not list, so the one NuxtImg renders is allowed by the hash of
  // Its exact text and nothing else
  test("allows the image error handler by its hash and no other inline handler", async () => {
    expect.hasAssertions();

    vi.resetModules();
    const { security } = await import("#configuration/security");

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

  // A dedicated worker's script is refused unless its response carries the embedder policy its page sends. The build's
  // Scripts are served from the static assets, which never reach the Worker's request hook, so the policy is a route
  // Rule
  test("serves the build's folder under the embedder policy its pages send", () => {
    expect.hasAssertions();

    expect(routeRules["/_nuxt/:file"]?.headers).toStrictEqual({
      "cache-control": IMMUTABLE_CACHE_CONTROL,
      "Cross-Origin-Embedder-Policy": "credentialless",
      "X-Robots-Tag": "noindex",
    });
  });
});
