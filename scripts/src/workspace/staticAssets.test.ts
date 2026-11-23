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
  // The service worker precaches a file only up to this size, so a larger one is left out of the list and fetched when
  // The page needs it (`apps/web/configuration/pwa.ts`)
  const PRECACHE_LIMIT_BYTES = 2 * MEBIBYTE;
  const UNCOMPRESSED_AUDIO_EXTENSIONS = new Set([".aiff", ".flac", ".wav"]);

  test("no served file is over the precache limit", () => {
    expect.hasAssertions();

    expect(
      readSweepFilePaths(...SERVED_PATHSPECS).filter(
        (path) => statSync(join(REPOSITORY_ROOT, path)).size > PRECACHE_LIMIT_BYTES,
      ),
    ).toStrictEqual([]);
  });

  test("no served file is uncompressed audio", () => {
    expect.hasAssertions();

    expect(
      readSweepFilePaths(...SERVED_PATHSPECS).filter((path) => UNCOMPRESSED_AUDIO_EXTENSIONS.has(extname(path))),
    ).toStrictEqual([]);
  });
});
