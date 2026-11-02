import { saveStagedResourceContentInputSchema } from "#shared/models/db/resource/SaveStagedResourceContentInput";
import { describe, expect, test } from "vitest";

describe("saveStagedResourceContentInputSchema", () => {
  // The server compares the staged bytes against lowercase hex, so an uppercase digest of the same bytes is refused at
  // the boundary rather than after the upload has been staged
  test("refuses an uppercase hash", () => {
    expect.hasAssertions();

    const hash = "ab".repeat(32);
    const input = { contentVersion: 0, id: crypto.randomUUID() };

    expect(saveStagedResourceContentInputSchema.safeParse({ ...input, hash }).success).toBe(true);
    expect(saveStagedResourceContentInputSchema.safeParse({ ...input, hash: hash.toUpperCase() }).success).toBe(false);
  });
});
