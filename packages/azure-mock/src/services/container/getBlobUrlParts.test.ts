import { getBlobUrlParts } from "#src/services/container/getBlobUrlParts";
import { describe, expect, test } from "vitest";

describe(getBlobUrlParts, () => {
  // A lone percent sign is malformed in its own segment only, so that segment stays raw and the one after it still decodes
  test("keeps a segment with a lone percent sign raw and decodes the other segments", () => {
    expect.hasAssertions();

    expect(getBlobUrlParts("https://account.blob.core.windows.net/container/100%/a%20b")).toStrictEqual({
      blobName: "100%/a b",
      containerName: "container",
    });
  });
});
