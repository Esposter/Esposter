import { BUNDLE_SIZES_FILENAME } from "#src/services/bundleSizes/constants";
import { readBundleSizes } from "#src/services/bundleSizes/readBundleSizes";
import { renderBundleSizes } from "#src/services/bundleSizes/renderBundleSizes";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, test } from "vitest";

/**
 * Every built file's size is committed in `bundle-sizes.md`, so a change that moves a bundle shows its exact bytes in the
 * diff, a shrink as plainly as a growth. This holds the record to a fresh build: it fails on any file that grew, shrank,
 * appeared or went, and the fix is `pnpm bundle-sizes:gen` after a build, committed with the change (`testing` skill).
 */
describe("bundleSizes", () => {
  const record = readFileSync(resolve(REPOSITORY_ROOT, BUNDLE_SIZES_FILENAME), "utf8");
  const bundleSizes = readBundleSizes(REPOSITORY_ROOT);

  test("the record is the size of every built file", () => {
    expect.hasAssertions();

    expect(renderBundleSizes(bundleSizes)).toBe(record);
  });

  // The record's reach is the build's, so a build that found no package would pass the test above against nothing
  test("finds the built packages", () => {
    expect.hasAssertions();

    expect(bundleSizes.length).toBeGreaterThan(0);
  });
});
