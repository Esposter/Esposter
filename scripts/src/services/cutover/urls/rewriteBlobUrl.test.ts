import { rewriteBlobUrl } from "#src/services/cutover/urls/rewriteBlobUrl";
import { describe, expect, test } from "vitest";

describe(rewriteBlobUrl, () => {
  const PUBLIC_ASSETS_BASE_URL = "https://assets.esposter.com";

  test("points an Azure blob URL at its bucket's public route and drops the SAS query", () => {
    expect.hasAssertions();

    expect(
      rewriteBlobUrl(
        "https://prodstesposter001.blob.core.windows.net/public-user-assets/avatar%20one.png?sv=2025&sig=secret",
        PUBLIC_ASSETS_BASE_URL,
      ),
    ).toBe("https://assets.esposter.com/public-user-assets/avatar%20one.png");
  });

  test("leaves a URL that is not an Azure blob URL as it is", () => {
    expect.hasAssertions();

    expect(rewriteBlobUrl("https://example.com/avatar.png", PUBLIC_ASSETS_BASE_URL)).toBeUndefined();
  });

  test("refuses a blob URL naming a container with no bucket", () => {
    expect.hasAssertions();

    expect(() =>
      rewriteBlobUrl("https://prodstesposter001.blob.core.windows.net/deadletter/key.json", PUBLIC_ASSETS_BASE_URL),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Update, name: deadletter, is not a container with a bucket, so its URL has no target]`,
    );
  });
});
