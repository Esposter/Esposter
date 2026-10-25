import { generateDownloadFileSasUrlsInputSchema } from "#shared/models/db/message/GenerateDownloadFileSasUrlsInput";
import { describe, expect, test } from "vitest";

describe("generateDownloadFileSasUrlsInputSchema", () => {
  const roomId = crypto.randomUUID();
  const filename = "a";
  const mimetype = "mimetype";
  const file = { filename, id: crypto.randomUUID(), mimetype };

  test("parses the files a room asks read urls for", () => {
    expect.hasAssertions();

    expect(generateDownloadFileSasUrlsInputSchema.parse({ files: [file], roomId })).toStrictEqual({
      files: [file],
      roomId,
    });
  });

  // The batch mints one read SAS per entry, so two entries naming one blob spend two of the read limit's slots on
  // The same url. Keying the uniqueness on `id` rather than on the whole entry is what catches it — the same blob
  // Under a second filename is still the same blob
  test("rejects two entries naming the same file", () => {
    expect.hasAssertions();

    expect(
      generateDownloadFileSasUrlsInputSchema.safeParse({ files: [file, { ...file, filename: " " }], roomId }).success,
    ).toBe(false);
  });
});
