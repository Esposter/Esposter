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

  // The batch mints one presigned read url per entry, so two entries naming one blob spend two of the read limit's slots on
  // The same url. Keying the uniqueness on `id` rather than on the whole entry is what catches it — the same blob
  // Under a second filename is still the same blob
  test("rejects two entries naming the same file", () => {
    expect.hasAssertions();

    expect(
      generateDownloadFilePresignedUrlsInputSchema.safeParse({ files: [file, { ...file, filename: " " }], roomId })
        .success,
    ).toBe(false);
  });
});
