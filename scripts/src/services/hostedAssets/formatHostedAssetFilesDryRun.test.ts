import { filesPair } from "#src/services/hostedAssets/constants.test";
import { formatHostedAssetFilesDryRun } from "#src/services/hostedAssets/formatHostedAssetFilesDryRun";
import { planHostedAssetFiles } from "#src/services/hostedAssets/planHostedAssetFiles";
import { TEST_FILENAME } from "#src/services/shared/fixtureConstants.test";
import { describe, expect, test } from "vitest";

describe(formatHostedAssetFilesDryRun, () => {
  test("names the lock entry a publish adds and stores only the object the published lock does not name", () => {
    expect.hasAssertions();

    const current = planHostedAssetFiles(TEST_FILENAME, filesPair.slice(0, 1));
    const next = planHostedAssetFiles(TEST_FILENAME, filesPair);

    expect(formatHostedAssetFilesDryRun(TEST_FILENAME, current.lock, next.lock, next.records)).toMatchInlineSnapshot(`
      "a: dry run, nothing stored, 1 to publish
        object a/a/a.png
        store a/e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855.png: 0 bytes"
    `);
  });
});
