import { getBlobNameFromUrl } from "@/services/azure/container/getBlobNameFromUrl";
import { describe, expect, test } from "vitest";

const prefix = "https://account.blob.core.windows.net/resource-assets/";

describe(getBlobNameFromUrl, () => {
  test("should decode the path suffix that follows the prefix", () => {
    expect.hasAssertions();

    expect(getBlobNameFromUrl(`${prefix}1/photo%20%281%29.png`, prefix)).toBe("1/photo (1).png");
  });

  test("should return undefined for a url whose percent escapes are invalid", () => {
    expect.hasAssertions();

    expect(getBlobNameFromUrl(`${prefix}1/100%off.png`, prefix)).toBeUndefined();
  });
});
