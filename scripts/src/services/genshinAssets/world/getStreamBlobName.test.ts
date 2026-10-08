import { getStreamBlobName } from "#src/services/genshinAssets/world/getStreamBlobName";
import { describe, expect, test } from "vitest";

describe(getStreamBlobName, () => {
  test("names a tile's blob and a city area's by the hash of their paths, as the installed asset index does", () => {
    expect.hasAssertions();

    expect(getStreamBlobName("BigWorld_1_-2")).toBe("012854bd");
    expect(getStreamBlobName("Area_FQD_City")).toBe("6977197b");
  });
});
