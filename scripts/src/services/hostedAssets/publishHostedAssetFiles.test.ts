import type { HostedAssetProduct } from "#src/models/hostedAssets/HostedAssetProduct";

import { filesProductBase } from "#src/services/hostedAssets/constants.test";
import { publishHostedAssetFiles } from "#src/services/hostedAssets/publishHostedAssetFiles";
import { TEST_FILENAME } from "#src/services/shared/fixtureConstants.test";
import { describe, expect, test } from "vitest";

describe(publishHostedAssetFiles, () => {
  const product: HostedAssetProduct = { ...filesProductBase, source: { kind: "records" } };

  test("a records product is refused, since its own command publishes it", async () => {
    expect.hasAssertions();

    await expect(publishHostedAssetFiles(product, true)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Update, name: a, is published by its own command]`,
    );
  });

  test("a files product declaring two scopes is refused before its folder is read", async () => {
    expect.hasAssertions();

    // The product's folder is not in the repository, so a read that reached it would fail with its own error instead
    const twoScopes: HostedAssetProduct = {
      ...filesProductBase,
      scopes: [TEST_FILENAME, `${TEST_FILENAME}/${TEST_FILENAME}`],
      source: { folder: TEST_FILENAME, kind: "files", unhostedExtensions: [] },
    };

    await expect(publishHostedAssetFiles(twoScopes, true)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Update, name: a, must declare exactly one scope]`,
    );
  });
});
