import { getFileBlobNames } from "@/services/azure/container/getFileBlobNames";
import { getFilesBlobNames } from "@/services/azure/container/getFilesBlobNames";
import { describe, expect, test } from "vitest";

describe(getFilesBlobNames, () => {
  const prefix = crypto.randomUUID();
  const firstId = crypto.randomUUID();
  const secondId = crypto.randomUUID();
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
