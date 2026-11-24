import { generateDownloadFilePresignedUrlsInputSchema } from "#shared/models/db/message/GenerateDownloadFilePresignedUrlsInput";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe("generateDownloadFilePresignedUrlsInputSchema", () => {
  const roomId = v7();
  const filename = "a";
  const mimetype = "mimetype";
  const file = { filename, id: v7(), mimetype };

  test("parses the files a room asks read urls for", () => {
    expect.hasAssertions();

    expect(generateDownloadFilePresignedUrlsInputSchema.parse({ files: [file], roomId })).toStrictEqual({
      files: [file],
      roomId,
    });
  });

  // The batch mints one presigned read url per entry, so two entries naming one blob spend two read limit slots.
  // Two slots on the same url are wasted, so the uniqueness is keyed on `id` rather than on the whole entry.
  // The same blob under a second filename is still the same blob
  test("rejects two entries naming the same file", () => {
    expect.hasAssertions();

    expect(
      generateDownloadFilePresignedUrlsInputSchema.safeParse({ files: [file, { ...file, filename: " " }], roomId })
        .success,
    ).toBe(false);
  });
});
