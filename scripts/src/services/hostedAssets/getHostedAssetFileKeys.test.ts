import { filesPair } from "#src/services/hostedAssets/constants.test";
import { getHostedAssetFileKeys } from "#src/services/hostedAssets/getHostedAssetFileKeys";
import { planHostedAssetFiles } from "#src/services/hostedAssets/planHostedAssetFiles";
import { TEST_FILENAME } from "#src/services/shared/fixtureConstants.test";
import { describe, expect, test } from "vitest";

describe(getHostedAssetFileKeys, () => {
  test("names each file of a two-object lock by its key under the folder", () => {
    expect.hasAssertions();

    const { lock } = planHostedAssetFiles(TEST_FILENAME, filesPair);

    expect(getHostedAssetFileKeys(TEST_FILENAME, lock)).toStrictEqual(filesPair.map(({ key }) => key));
  });
});
