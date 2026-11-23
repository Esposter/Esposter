import { MEBIBYTE, REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { statSync } from "node:fs";
import { extname, join } from "node:path";
import { describe, expect, test } from "vitest";

/**
 * Every file in these folders is shipped to the browser: the app's own assets are bundled and served from the edge, and
 * `public/` is served as it is. A file over the limit is left out of the service worker, and an uncompressed audio file
 * is many times the size of the same sound in MP3, so both are checked here rather than trusted to review. A file over
 * the limit that the bundle must not hold is hosted instead (`openspec/specs/architecture/hosted-assets/design.md`).
 */
describe("staticAssets", () => {
  const BUNDLED_PATHSPECS = ["apps/web/app/assets"];
  const PUBLIC_PATHSPECS = ["apps/web/public"];
  // The service worker precaches a build's js, css and html only up to this size, and leaves a larger one out of the list
  // (`apps/web/configuration/pwa.ts`). The bundle holds a file only up to the same figure, so one limit is the budget
  const SIZE_LIMIT_BYTES = 2 * MEBIBYTE;
  const UNCOMPRESSED_AUDIO_EXTENSIONS = new Set([".aiff", ".flac", ".wav"]);

  const checkIsOversizedOrUncompressed = (path: string): boolean =>
    statSync(join(REPOSITORY_ROOT, path)).size > SIZE_LIMIT_BYTES || UNCOMPRESSED_AUDIO_EXTENSIONS.has(extname(path));

  test("a small UI icon is bundled", () => {
    expect.hasAssertions();

    expect(
      readSweepFilePaths(...BUNDLED_PATHSPECS).filter((path) => checkIsOversizedOrUncompressed(path)),
    ).toStrictEqual([]);
  });

  test("no public file is over the limit or uncompressed audio", () => {
    expect.hasAssertions();

    expect(
      readSweepFilePaths(...PUBLIC_PATHSPECS).filter((path) => checkIsOversizedOrUncompressed(path)),
    ).toStrictEqual([]);
  });
});
