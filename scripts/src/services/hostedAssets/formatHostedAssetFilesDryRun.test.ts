import { formatHostedAssetFilesDryRun } from "#src/services/hostedAssets/formatHostedAssetFilesDryRun";
import { planHostedAssetFiles } from "#src/services/hostedAssets/planHostedAssetFiles";
import { TEST_FILENAME } from "#src/services/shared/fixtureConstants.test";
import { getContentAddress } from "@esposter/shared-node/cache";
import { describe, expect, test } from "vitest";

describe(formatHostedAssetFilesDryRun, () => {
  test("names the lock entry a publish adds and stores only the object the published lock does not name", () => {
    expect.hasAssertions();

    const bytesA = Buffer.from(TEST_FILENAME);
    const bytesB = Buffer.from("");
    const fileA = { bytes: bytesA, extension: ".png", key: `${TEST_FILENAME}.png`, sha256: getContentAddress(bytesA) };
    const fileB = {
      bytes: bytesB,
      extension: ".png",
      key: `${TEST_FILENAME}/${TEST_FILENAME}.png`,
      sha256: getContentAddress(bytesB),
    };
    const current = planHostedAssetFiles(TEST_FILENAME, [fileA]);
    const next = planHostedAssetFiles(TEST_FILENAME, [fileA, fileB]);

    expect(formatHostedAssetFilesDryRun(TEST_FILENAME, current.lock, next.lock, next.records)).toMatchInlineSnapshot(`
      "a: dry run, nothing stored
        object a/a/a.png
        store a/e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855.png: 0 bytes"
    `);
  });
});
