import { FILES_DIRECTORY_SEGMENT, PUBLISHED_DIRECTORY_SEGMENT } from "#shared/services/resource/constants";
import { getFilesDirectoryName } from "#shared/services/resource/getFilesDirectoryName";
import { parseResourceAssetPath } from "#shared/services/resource/parseResourceAssetPath";
import { ID_SEPARATOR } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(parseResourceAssetPath, () => {
  const resourceId = crypto.randomUUID();

  test("should parse a files path", () => {
    expect.hasAssertions();

    expect(parseResourceAssetPath(`${getFilesDirectoryName(resourceId)}/a%7Ca`)).toStrictEqual({
      blobName: `${getFilesDirectoryName(resourceId)}/a${ID_SEPARATOR}a`,
      isPublished: false,
      resourceId,
    });
  });

  test("should parse a published path", () => {
    expect.hasAssertions();

    expect(
      parseResourceAssetPath(`${resourceId}/${PUBLISHED_DIRECTORY_SEGMENT}/12/${FILES_DIRECTORY_SEGMENT}/a%7Ca`),
    ).toStrictEqual({
      blobName: `${resourceId}/${PUBLISHED_DIRECTORY_SEGMENT}/12/${FILES_DIRECTORY_SEGMENT}/a${ID_SEPARATOR}a`,
      isPublished: true,
      resourceId,
    });
  });

  test.each([
    ["dot-dot segment", `${resourceId}/../${FILES_DIRECTORY_SEGMENT}/a`],
    ["encoded dot-dot segment", `${resourceId}/%2E%2E/${FILES_DIRECTORY_SEGMENT}/a`],
    ["encoded slash inside a segment", `${resourceId}/${FILES_DIRECTORY_SEGMENT}%2Fa`],
    ["encoded backslash inside a segment", `${getFilesDirectoryName(resourceId)}/a%5C`],
    ["invalid percent escape", `${getFilesDirectoryName(resourceId)}/a%GG`],
    ["empty segment", `${getFilesDirectoryName(resourceId)}//a`],
    ["non-uuid resource id", `not-a-uuid/${FILES_DIRECTORY_SEGMENT}/a`],
    ["too few segments", getFilesDirectoryName(resourceId)],
    ["too many files segments", `${getFilesDirectoryName(resourceId)}/extra/a`],
    ["published without version", `${resourceId}/${PUBLISHED_DIRECTORY_SEGMENT}/${FILES_DIRECTORY_SEGMENT}/a`],
    ["published with version zero", `${resourceId}/${PUBLISHED_DIRECTORY_SEGMENT}/0/${FILES_DIRECTORY_SEGMENT}/a`],
    ["published with negative version", `${resourceId}/${PUBLISHED_DIRECTORY_SEGMENT}/-1/${FILES_DIRECTORY_SEGMENT}/a`],
    [
      "published with non-numeric version",
      `${resourceId}/${PUBLISHED_DIRECTORY_SEGMENT}/one/${FILES_DIRECTORY_SEGMENT}/a`,
    ],
    [
      "published with trailing extra segment",
      `${resourceId}/${PUBLISHED_DIRECTORY_SEGMENT}/1/${FILES_DIRECTORY_SEGMENT}/a/extra`,
    ],
    ["unknown directory", `${resourceId}/assets/a`],
  ])("should reject %s", (_description, encodedPath) => {
    expect.hasAssertions();

    expect(parseResourceAssetPath(encodedPath)).toBeUndefined();
  });
});
