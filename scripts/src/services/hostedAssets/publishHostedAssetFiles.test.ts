import type { HostedAssetProduct } from "#src/models/hostedAssets/HostedAssetProduct";

import { publishHostedAssetFiles } from "#src/services/hostedAssets/publishHostedAssetFiles";
import { TEST_FILENAME } from "#src/services/shared/fixtureConstants.test";
import { StorageBucket } from "@esposter/db-schema";
import { describe, expect, test } from "vitest";

describe(publishHostedAssetFiles, () => {
  const product: HostedAssetProduct = {
    bucket: StorageBucket.PublicHostedAssets,
    lockPath: TEST_FILENAME,
    lockRepositoryPath: TEST_FILENAME,
    name: TEST_FILENAME,
    scopes: [TEST_FILENAME],
    source: { kind: "records" },
  };

  test("a records product is refused, since its own command publishes it", async () => {
    expect.hasAssertions();

    await expect(publishHostedAssetFiles(product, true)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Update, name: a, is published by its own command]`,
    );
  });
});
