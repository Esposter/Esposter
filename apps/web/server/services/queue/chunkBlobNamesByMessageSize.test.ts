import { chunkBlobNamesByMessageSize } from "#server/services/queue/chunkBlobNamesByMessageSize";
import { MAX_BLOB_DELETION_MESSAGE_BLOB_NAMES, MAX_BLOB_DELETION_MESSAGE_BYTES } from "@esposter/db-schema";
import { describe, expect, test } from "vitest";

describe(chunkBlobNamesByMessageSize, () => {
  const blobName = "a";
  // The character under test and nothing wrapped around it: three UTF-8 bytes for one unit of length, which is
  // What a name count cannot see. Sized so one name alone fits and two do not, so the split can only be the
  // Byte budget's doing — a count bound would keep all of them in one chunk.
  const multiByteBlobName = "字".repeat(Math.ceil(MAX_BLOB_DELETION_MESSAGE_BYTES / 2 / 3));
  // The other way a name outgrows its own bytes: a quote is two bytes once escaped. Sized the same way, so a
  // Chunker measuring the raw name keeps both and blows the budget.
  const escapedBlobName = '"'.repeat(Math.ceil(MAX_BLOB_DELETION_MESSAGE_BYTES / 2 / 2));

  test("keeps a set within both bounds in one chunk", () => {
    expect.hasAssertions();

    const blobNames = Array.from({ length: MAX_BLOB_DELETION_MESSAGE_BLOB_NAMES }, () => blobName);

    expect(chunkBlobNamesByMessageSize(blobNames)).toStrictEqual([blobNames]);
  });

  test("splits on the name count", () => {
    expect.hasAssertions();

    const blobNames = Array.from({ length: MAX_BLOB_DELETION_MESSAGE_BLOB_NAMES + 1 }, () => blobName);

    expect(chunkBlobNamesByMessageSize(blobNames)).toStrictEqual([
      blobNames.slice(0, MAX_BLOB_DELETION_MESSAGE_BLOB_NAMES),
      [blobName],
    ]);
  });

  test("splits on the byte budget before the name count", () => {
    expect.hasAssertions();

    const blobNames = [multiByteBlobName, multiByteBlobName];
    const chunks = chunkBlobNamesByMessageSize(blobNames);

    expect(chunks).toStrictEqual([[multiByteBlobName], [multiByteBlobName]]);
    for (const chunk of chunks)
      expect(Buffer.byteLength(JSON.stringify(chunk), "utf8")).toBeLessThanOrEqual(MAX_BLOB_DELETION_MESSAGE_BYTES);
  });

  test("splits on the escaped byte budget", () => {
    expect.hasAssertions();

    const blobNames = [escapedBlobName, escapedBlobName];
    const chunks = chunkBlobNamesByMessageSize(blobNames);

    expect(chunks).toStrictEqual([[escapedBlobName], [escapedBlobName]]);
    for (const chunk of chunks)
      expect(Buffer.byteLength(JSON.stringify(chunk), "utf8")).toBeLessThanOrEqual(MAX_BLOB_DELETION_MESSAGE_BYTES);
  });

  test("gives a name larger than the whole budget its own chunk", () => {
    expect.hasAssertions();

    const oversizedBlobName = "字".repeat(MAX_BLOB_DELETION_MESSAGE_BYTES);

    expect(chunkBlobNamesByMessageSize([blobName, oversizedBlobName])).toStrictEqual([[blobName], [oversizedBlobName]]);
  });

  test("returns nothing for no names", () => {
    expect.hasAssertions();

    expect(chunkBlobNamesByMessageSize([])).toStrictEqual([]);
  });
});
