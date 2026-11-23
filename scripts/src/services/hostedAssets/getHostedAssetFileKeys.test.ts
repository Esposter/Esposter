import { getHostedAssetFileKeys } from "#src/services/hostedAssets/getHostedAssetFileKeys";
import { planHostedAssetFiles } from "#src/services/hostedAssets/planHostedAssetFiles";
import { TEST_FILENAME } from "#src/services/shared/fixtureConstants.test";
import { getContentAddress } from "@esposter/shared-node/cache";
import { describe, expect, test } from "vitest";

describe(getHostedAssetFileKeys, () => {
  test("names each file of a two-object lock by its key under the folder", () => {
    expect.hasAssertions();

    const bytesA = Buffer.from(TEST_FILENAME);
    const bytesB = Buffer.from("");
    const keyA = `${TEST_FILENAME}.png`;
    const keyB = `${TEST_FILENAME}/${TEST_FILENAME}.png`;
    const { lock } = planHostedAssetFiles(TEST_FILENAME, [
      { bytes: bytesA, extension: ".png", key: keyA, sha256: getContentAddress(bytesA) },
      { bytes: bytesB, extension: ".png", key: keyB, sha256: getContentAddress(bytesB) },
    ]);

    expect(getHostedAssetFileKeys(TEST_FILENAME, lock)).toStrictEqual([keyA, keyB]);
  });
});
