import { GCSIM_REPOSITORY_URL, GCSIM_TAG } from "#src/services/genshinAssets/kits/constants";
import { getGcsimLinks } from "#src/services/sweeps/gcsimLinks/getGcsimLinks";
import { describe, expect, test } from "vitest";

describe(getGcsimLinks, () => {
  const treeUrl = `${GCSIM_REPOSITORY_URL}/tree/${GCSIM_TAG}`;
  const blobUrl = `${GCSIM_REPOSITORY_URL}/blob/${GCSIM_TAG}`;

  test("reports a link at another ref, and only the ref", () => {
    expect.hasAssertions();

    expect(getGcsimLinks(`[gcsim](${GCSIM_REPOSITORY_URL}/tree/main)`)).toStrictEqual([
      `${GCSIM_REPOSITORY_URL}/tree/main`,
    ]);
  });

  // A tag that only begins with the kits' tag is a different ref, so the boundary is what excludes the tag
  test("reports a ref that starts with the kits' tag", () => {
    expect.hasAssertions();

    expect(getGcsimLinks(`${blobUrl}0/internal/x.go`)).toStrictEqual([`${blobUrl}0`]);
  });

  test.each([
    ["the tag at the end of a line", treeUrl],
    ["the tag closing a markdown link", `[gcsim](${treeUrl})`],
    ["the tag before a fragment", `${blobUrl}#L5`],
    ["the tag before a path", `${blobUrl}/internal/x.go`],
  ])("reports nothing for the kits' tag, %s", (_form, line) => {
    expect.hasAssertions();

    expect(getGcsimLinks(line)).toStrictEqual([]);
  });
});
