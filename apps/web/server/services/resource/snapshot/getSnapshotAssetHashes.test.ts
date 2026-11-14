import { getSnapshotAssetHashes } from "#server/services/resource/snapshot/getSnapshotAssetHashes";
import { getResourceAssetUrl } from "#shared/services/resource/getResourceAssetUrl";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(getSnapshotAssetHashes, () => {
  const resourceId = v7();
  const assetHash = "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08";
  const assetUrl = getResourceAssetUrl(`${resourceId}/files/${assetHash}`);

  // A whiteboard image stores the hash of its file as the bare id of the element, with no url for a scan of urls to read
  test("finds the file an element names by its bare id", () => {
    expect.hasAssertions();

    expect(getSnapshotAssetHashes(JSON.stringify({ elements: [{ fileId: assetHash }] }))).toStrictEqual(
      new Set([assetHash]),
    );
  });

  test("finds the file a url names", () => {
    expect.hasAssertions();

    expect(getSnapshotAssetHashes(JSON.stringify({ sections: [{ image: assetUrl }] }))).toStrictEqual(
      new Set([assetHash]),
    );
  });

  // The address is a whole token: a run of letters or digits that merely contains it names no file
  test.each([
    ["a digit before it", `0${assetHash}`],
    ["a letter after it", `${assetHash}g`],
  ])("ignores an address with %s", (_description, fileId) => {
    expect.hasAssertions();

    expect(getSnapshotAssetHashes(JSON.stringify({ fileId }))).toStrictEqual(new Set());
  });

  test("ignores an uppercase address", () => {
    expect.hasAssertions();

    expect(getSnapshotAssetHashes(JSON.stringify({ fileId: assetHash.toUpperCase() }))).toStrictEqual(new Set());
  });

  test("collects each asset once however many times it occurs", () => {
    expect.hasAssertions();

    expect(getSnapshotAssetHashes(JSON.stringify({ fileId: assetHash, src: assetUrl }))).toStrictEqual(
      new Set([assetHash]),
    );
  });

  test("answers an empty set for content that embeds no asset", () => {
    expect.hasAssertions();

    expect(getSnapshotAssetHashes(JSON.stringify({ items: [], title: "" }))).toStrictEqual(new Set());
  });
});
