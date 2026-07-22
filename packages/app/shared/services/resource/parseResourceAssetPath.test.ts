import { parseResourceAssetPath } from "#shared/services/resource/parseResourceAssetPath";
import { describe, expect, test } from "vitest";

describe(parseResourceAssetPath, () => {
  const resourceId = crypto.randomUUID();

  test("should parse a files path", () => {
    expect.hasAssertions();

    expect(parseResourceAssetPath(`${resourceId}/files/abc%7Cimage.png`)).toStrictEqual({
      blobName: `${resourceId}/files/abc|image.png`,
      isPublished: false,
      resourceId,
    });
  });

  test("should parse a published path", () => {
    expect.hasAssertions();

    expect(parseResourceAssetPath(`${resourceId}/published/12/files/abc%7Cimage.png`)).toStrictEqual({
      blobName: `${resourceId}/published/12/files/abc|image.png`,
      isPublished: true,
      resourceId,
    });
  });

  test.each([
    ["dot-dot segment", `${resourceId}/../files/image.png`],
    ["encoded dot-dot segment", `${resourceId}/%2E%2E/files/image.png`],
    ["encoded slash inside a segment", `${resourceId}/files%2Fimage.png`],
    ["encoded backslash inside a segment", `${resourceId}/files/image%5C.png`],
    ["invalid percent escape", `${resourceId}/files/image%GG.png`],
    ["empty segment", `${resourceId}/files//image.png`],
    ["non-uuid resource id", "not-a-uuid/files/image.png"],
    ["too few segments", `${resourceId}/files`],
    ["too many files segments", `${resourceId}/files/extra/image.png`],
    ["published without version", `${resourceId}/published/files/image.png`],
    ["published with version zero", `${resourceId}/published/0/files/image.png`],
    ["published with negative version", `${resourceId}/published/-1/files/image.png`],
    ["published with non-numeric version", `${resourceId}/published/one/files/image.png`],
    ["published with trailing extra segment", `${resourceId}/published/1/files/image.png/extra`],
    ["unknown directory", `${resourceId}/assets/image.png`],
  ])("should reject %s", (_description, encodedPath) => {
    expect.hasAssertions();

    expect(parseResourceAssetPath(encodedPath)).toBeUndefined();
  });
});
