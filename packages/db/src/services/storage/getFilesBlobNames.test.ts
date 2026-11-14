import { getFileBlobNames } from "#src/services/storage/getFileBlobNames";
import { getFilesBlobNames } from "#src/services/storage/getFilesBlobNames";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(getFilesBlobNames, () => {
  const prefix = v7();
  const firstId = v7();
  const secondId = v7();
  const filename = "a";

  test("names nothing when the delete carries no files", () => {
    expect.hasAssertions();

    expect(getFilesBlobNames(prefix, [])).toStrictEqual([]);
  });

  // A file owns more than one blob, so keeping only the original would leave every thumbnail behind as a blob
  // Nothing ever reclaims — each file contributes every name `getFileBlobNames` gives it
  test("names every blob each file owns", () => {
    expect.hasAssertions();

    const firstBlobNames = getFileBlobNames(prefix, firstId, filename);
    const secondBlobNames = getFileBlobNames(prefix, secondId, filename);

    expect(
      getFilesBlobNames(prefix, [
        { filename, id: firstId },
        { filename, id: secondId },
      ]),
    ).toStrictEqual([
      firstBlobNames.blobName,
      firstBlobNames.thumbnailBlobName,
      secondBlobNames.blobName,
      secondBlobNames.thumbnailBlobName,
    ]);
  });
});
