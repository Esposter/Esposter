import { encodeBlobUrl } from "@/services/azure/container/encodeBlobUrl";
import { describe, expect, test } from "vitest";

describe(encodeBlobUrl, () => {
  test("should return a url without sub-delimiters unchanged", () => {
    expect.hasAssertions();

    expect(encodeBlobUrl("https://account.blob.core.windows.net/c/1/photo.png?sig=a%2Fb")).toBe(
      "https://account.blob.core.windows.net/c/1/photo.png?sig=a%2Fb",
    );
  });

  test("should encode the sub-delimiters Azure leaves literal in the blob path", () => {
    expect.hasAssertions();

    expect(encodeBlobUrl("https://account.blob.core.windows.net/c/1/photo(1)!'*.png")).toBe(
      "https://account.blob.core.windows.net/c/1/photo%281%29%21%27%2A.png",
    );
  });

  test("should encode the sub-delimiters a download SAS carries in its rscd query", () => {
    expect.hasAssertions();

    expect(encodeBlobUrl("https://account.blob.core.windows.net/c/1/a.png?rscd=filename%3D%22photo(1).png%22")).toBe(
      "https://account.blob.core.windows.net/c/1/a.png?rscd=filename%3D%22photo%281%29.png%22",
    );
  });
});
