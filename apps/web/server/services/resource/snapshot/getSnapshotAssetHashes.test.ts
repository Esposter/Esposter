import { getSnapshotAssetHashes } from "#server/services/resource/snapshot/getSnapshotAssetHashes";
import { getResourceAssetUrl } from "#shared/services/resource/getResourceAssetUrl";
import { afterEach, describe, expect, test, vi } from "vitest";

describe(getSnapshotAssetHashes, () => {
  const resourceId = crypto.randomUUID();
  const assetHash = "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08";
  const assetUrl = getResourceAssetUrl(`${resourceId}/files/${assetHash}`);

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  // The scan reads every string whatever the schema, so each content shape that can embed an image is its own case:
  // A block-editor image, a choice's picture, an html string carrying the url, and a list nested inside objects
  test.each([
    ["webpage", { sections: [{ image: assetUrl, type: "image" }], title: "" }],
    ["survey", { pages: [{ questions: [{ choices: [{ image: assetUrl }] }] }] }],
    ["email", { html: `<img src="${assetUrl}" />` }],
    ["note", { content: [{ attrs: { src: assetUrl }, type: "image" }], type: "doc" }],
    ["nested", { a: { b: { c: [{ d: [assetUrl] }] } } }],
  ])("finds the asset a %s embeds", (_title, content) => {
    expect.hasAssertions();

    expect(getSnapshotAssetHashes(resourceId, content)).toStrictEqual(new Set([assetHash]));
  });

  test("collects each asset once however many urls name it", () => {
    expect.hasAssertions();

    expect(getSnapshotAssetHashes(resourceId, { first: assetUrl, second: [assetUrl] })).toStrictEqual(
      new Set([assetHash]),
    );
  });

  test("ignores an asset of another resource", () => {
    expect.hasAssertions();

    const otherResourceAssetUrl = getResourceAssetUrl(`${crypto.randomUUID()}/files/${assetHash}`);

    expect(getSnapshotAssetHashes(resourceId, { src: otherResourceAssetUrl })).toStrictEqual(new Set());
  });

  // A last segment that is not a lowercase content address names no object the store holds
  test("ignores a last segment that is not a lowercase content address", () => {
    expect.hasAssertions();

    const uppercaseAssetUrl = getResourceAssetUrl(`${resourceId}/files/${assetHash.toUpperCase()}`);

    expect(getSnapshotAssetHashes(resourceId, { src: uppercaseAssetUrl })).toStrictEqual(new Set());
  });

  // A foreign absolute url carrying our prefix is not a reference: the lookbehind refuses it, so it is never read
  test("ignores a foreign absolute url that carries the asset prefix", () => {
    expect.hasAssertions();

    expect(getSnapshotAssetHashes(resourceId, { src: `https://cdn.example.com${assetUrl}` })).toStrictEqual(new Set());
  });

  test("reads an own-origin absolute url as the asset it addresses", () => {
    expect.hasAssertions();

    vi.stubEnv("BASE_URL", "https://esposter.test");

    expect(getSnapshotAssetHashes(resourceId, { src: `https://esposter.test${assetUrl}` })).toStrictEqual(
      new Set([assetHash]),
    );
  });

  test("answers an empty set for content that embeds no asset", () => {
    expect.hasAssertions();

    expect(getSnapshotAssetHashes(resourceId, { title: "", items: [] })).toStrictEqual(new Set());
  });
});
