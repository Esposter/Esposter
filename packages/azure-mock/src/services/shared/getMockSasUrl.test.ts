import { getMockSasUrl } from "#src/services/shared/getMockSasUrl";
import { describe, expect, test } from "vitest";

describe(getMockSasUrl, () => {
  const url = "https://account.blob.core.windows.net/container/blob";

  // The Azure SDK writes `se` to the second, so a moment with milliseconds still names a whole second
  test("writes the expiry to the second, as the Azure SDK does", () => {
    expect.hasAssertions();

    const epochSecond = new Date(0).toISOString().replace(".000Z", "Z");
    const expiresOn = new Date(456);

    expect(new URL(getMockSasUrl(url, "w", "b", expiresOn)).searchParams.get("se")).toBe(epochSecond);
  });
});
