import { jsonDateParse } from "@esposter/shared";
import { spawnSync } from "@esposter/shared-node/child-process";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { assert, beforeAll, describe, expect, test } from "vitest";

/**
 * The module's order is the thing no unit sees: the worker is written once Nitro has copied the app into its public
 * folder, so its precache lists what Nitro serves, and a worker built from source holds the routes the server answers.
 * One build of the fixture app, a page, a server route and a worker in TypeScript, is read back for each.
 */
describe("build", () => {
  const FIXTURE_DIRECTORY = resolve(import.meta.dirname, "fixture");
  const NUXT_BINARY = resolve(import.meta.dirname, "../node_modules/nuxt/bin/nuxt.mjs");
  const BUILD_TIMEOUT: number = Temporal.Duration.from({ minutes: 2 }).total("milliseconds");
  const PUBLIC_DIRECTORY = join(FIXTURE_DIRECTORY, ".output", "public");
  let serviceWorker = "";

  beforeAll(() => {
    const { status, stderr } = spawnSync(process.execPath, [NUXT_BINARY, "build", FIXTURE_DIRECTORY], {
      cwd: FIXTURE_DIRECTORY,
      encoding: "utf8",
    });
    assert.strictEqual(stderr, "");
    assert.strictEqual(status, 0);
    serviceWorker = readFileSync(join(PUBLIC_DIRECTORY, "sw.js"), "utf8");
  }, BUILD_TIMEOUT);

  test("precache what Nitro served: the manifest, the app manifest of the build and the shell", () => {
    expect.hasAssertions();

    const urls = Array.from(serviceWorker.matchAll(/url:`(?<url>[^`]+)`/gu), ({ groups }) => groups?.url);

    expect(urls).toContain("manifest.webmanifest");
    expect(urls).toContain("/");
    expect(urls.some((url) => /^_nuxt\/builds\/meta\/[^/]+\.json$/u.test(url ?? ""))).toBe(true);
  });

  test("never answer a navigation to a route the server answers with the shell", () => {
    expect.hasAssertions();

    expect(serviceWorker).toContain("RegExp(`^\\\\/api\\\\/hello$`,`u`)");
  });

  test("write the web manifest with the theme colour the app configured", () => {
    expect.hasAssertions();

    const { theme_color: themeColor } = jsonDateParse<{ theme_color: string }>(
      readFileSync(join(PUBLIC_DIRECTORY, "manifest.webmanifest"), "utf8"),
    );

    expect(themeColor).toBe("#112233");
  });
});
