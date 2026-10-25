import { getMockSasUrl } from "#src/services/shared/getMockSasUrl";
import { describe, expect, test } from "vitest";

describe(getMockSasUrl, () => {
  const url = "https://account.blob.core.windows.net/container/blob";

  // The Azure SDK writes `se` to the second, so a moment with milliseconds still names a whole second
  test("writes the expiry to the second, as the Azure SDK does", () => {
    expect.hasAssertions();

    const expiresOn = new Date("2026-10-25T12:00:00.456Z");

    expect(getMockSasUrl(url, "w", "b", expiresOn)).toBe(
      `${url}?sv=2025-11-05&sr=b&sig=mock-signature&st=1970-01-01T00:00:00Z&se=2026-10-25T12:00:00Z&sp=w`,
    );
  });
});
