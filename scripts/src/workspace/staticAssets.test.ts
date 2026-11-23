import { MEBIBYTE, REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { statSync } from "node:fs";
import { extname, join } from "node:path";
import { describe, expect, test } from "vitest";

/**
 * Every file in these folders is shipped to the browser: the app's own assets are bundled and served from the edge, and
 * `public/` is served as it is. A file over the precache limit is left out of the service worker, and an uncompressed
 * audio file is many times the size of the same sound in MP3, so both are checked here rather than trusted to review.
 */
describe("staticAssets", () => {
  const SERVED_PATHSPECS = ["apps/web/app/assets", "apps/web/public"];
  // The service worker precaches a build's js, css and html only up to this size, and leaves a larger one out of the list
  // (`apps/web/configuration/pwa.ts`). The test holds every served file to it, since the one limit is the budget.
  const PRECACHE_LIMIT_BYTES = 2 * MEBIBYTE;
  const UNCOMPRESSED_AUDIO_EXTENSIONS = new Set([".aiff", ".flac", ".wav"]);
  const servedPaths = readSweepFilePaths(...SERVED_PATHSPECS);

  test("no served file is over the precache limit", () => {
    expect.hasAssertions();

    expect(
      servedPaths.filter((path) => statSync(join(REPOSITORY_ROOT, path)).size > PRECACHE_LIMIT_BYTES),
    ).toStrictEqual([]);
  });

  test("no served file is uncompressed audio", () => {
    expect.hasAssertions();

    expect(servedPaths.filter((path) => UNCOMPRESSED_AUDIO_EXTENSIONS.has(extname(path)))).toStrictEqual([]);
  });
});
