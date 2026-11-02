import { parseResourceAssetPath } from "#shared/services/resource/parseResourceAssetPath";
import { FILES_DIRECTORY_SEGMENT, getResourceFilesDirectoryName, SnapshotChannel } from "@esposter/db-schema";
import { describe, expect, test } from "vitest";

describe(parseResourceAssetPath, () => {
  const resourceId = crypto.randomUUID();
  const hash = "a".repeat(64);

  test("should parse a files path by its hash", () => {
    expect.hasAssertions();

    expect(parseResourceAssetPath(`${getResourceFilesDirectoryName(resourceId)}/${hash}`)).toStrictEqual({
      blobName: `${getResourceFilesDirectoryName(resourceId)}/${hash}`,
      hash,
      resourceId,
    });
  });

  test.each([
    ["dot-dot segment", `${resourceId}/../${FILES_DIRECTORY_SEGMENT}/${hash}`],
    ["encoded dot-dot segment", `${resourceId}/%2E%2E/${FILES_DIRECTORY_SEGMENT}/${hash}`],
    ["encoded slash inside a segment", `${resourceId}/${FILES_DIRECTORY_SEGMENT}%2F${hash}`],
    ["encoded backslash inside a segment", `${getResourceFilesDirectoryName(resourceId)}/${hash}%5C`],
    ["invalid percent escape", `${getResourceFilesDirectoryName(resourceId)}/%GG`],
    ["empty segment", `${getResourceFilesDirectoryName(resourceId)}//${hash}`],
    ["non-uuid resource id", `a/${FILES_DIRECTORY_SEGMENT}/${hash}`],
    ["too few segments", getResourceFilesDirectoryName(resourceId)],
    ["too many segments", `${getResourceFilesDirectoryName(resourceId)}/${hash}/${hash}`],
    ["unknown directory", `${resourceId}/a/${hash}`],
    ["published path", `${resourceId}/${SnapshotChannel.Published}/${FILES_DIRECTORY_SEGMENT}/${hash}`],
    ["filename-addressed segment", `${getResourceFilesDirectoryName(resourceId)}/a%7Ca`],
    ["uppercase hash", `${getResourceFilesDirectoryName(resourceId)}/${"A".repeat(64)}`],
    ["hash one character short", `${getResourceFilesDirectoryName(resourceId)}/${"a".repeat(63)}`],
    ["non-hex hash", `${getResourceFilesDirectoryName(resourceId)}/${"g".repeat(64)}`],
  ])("should reject %s", (_description, encodedPath) => {
    expect.hasAssertions();

    expect(parseResourceAssetPath(encodedPath)).toBeUndefined();
  });
});
