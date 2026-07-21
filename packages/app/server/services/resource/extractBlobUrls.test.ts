import { extractBlobUrls } from "@@/server/services/resource/extractBlobUrls";
import { AzureContainer } from "@esposter/db-schema";
import { MOCK_BLOB_BASE_URL } from "azure-mock";
import { describe, expect, test, vi } from "vitest";

const containerUrl = `${MOCK_BLOB_BASE_URL}/${AzureContainer.ResourceAssets}`;

vi.mock(import("@@/server/composables/azure/container/useContainerBaseUrl"), () => ({
  useContainerBaseUrl: () => MOCK_BLOB_BASE_URL,
}));

// Which urls match, and where each one ends, is `useBlobUrlSearchRegex`'s behaviour and is covered there.
// What is left here is this function's own: identity by path, and one entry per distinct asset
describe(extractBlobUrls, () => {
  test("should return an empty array when the content holds no blob url", () => {
    expect.hasAssertions();
    expect(extractBlobUrls(`"https://github.com"`)).toStrictEqual([]);
  });

  test("should return one entry per distinct url, however many times each appears", () => {
    expect.hasAssertions();

    const url = `${containerUrl}/1/photo.png`;
    const otherUrl = `${containerUrl}/2/photo.png`;

    expect(extractBlobUrls(`"${url}""${otherUrl}""${url}"`)).toStrictEqual([url, otherUrl]);
  });

  test("should identify a url by its path, dropping the SAS query it was last signed with", () => {
    expect.hasAssertions();

    const url = `${containerUrl}/1/my%20photo.png`;

    expect(extractBlobUrls(`"${url}?sv=2025-01-05&sig=a%2Fb""${url}?sig=c"`)).toStrictEqual([url]);
  });
});
