import { extractBlobUrls } from "@@/server/services/resource/extractBlobUrls";
import { AzureContainer } from "@esposter/db-schema";
import { MOCK_BLOB_BASE_URL } from "azure-mock";
import { describe, expect, test, vi } from "vitest";

const containerUrl = `${MOCK_BLOB_BASE_URL}/${AzureContainer.ResourceAssets}`;

vi.mock(import("@@/server/composables/azure/container/useContainerBaseUrl"), () => ({
  useContainerBaseUrl: () => MOCK_BLOB_BASE_URL,
}));

describe(extractBlobUrls, () => {
  test("should return an empty array for an empty model string", () => {
    expect.hasAssertions();
    expect(extractBlobUrls("")).toStrictEqual([]);
  });

  test("should return an empty array if no matching blob URLs are found", () => {
    expect.hasAssertions();

    expect(extractBlobUrls("https://github.com")).toStrictEqual([]);
  });

  test("should extract a single matching blob URL", () => {
    expect.hasAssertions();

    const url = `${containerUrl}/1`;

    expect(extractBlobUrls(`${url}"`)).toStrictEqual([url]);
  });

  test("should extract multiple unique matching blob URLs", () => {
    expect.hasAssertions();

    const url1 = `${containerUrl}/1`;
    const url2 = `${containerUrl}/2`;

    expect(extractBlobUrls(`${url1}"${url2}"`)).toStrictEqual([url1, url2]);
  });

  test("should extract only unique URLs if duplicates are present", () => {
    expect.hasAssertions();

    const url = `${containerUrl}/1`;

    expect(extractBlobUrls(`${url}"${url}"`)).toStrictEqual([url]);
  });

  test("should keep the URL percent-encoded so it can be found in the content verbatim", () => {
    expect.hasAssertions();

    const url = `${containerUrl}/1/my%20photo.png`;

    expect(extractBlobUrls(`${url}?sasToken"`)).toStrictEqual([url]);
  });

  test("should stop at the end of the SAS query when the URL is embedded in a single-quoted css url()", () => {
    expect.hasAssertions();

    const url = `${containerUrl}/1/photo (1).png`;

    expect(extractBlobUrls(`background-image:url('${url}?sv=2025-01-05&sig=a%2Fb');color:red`)).toStrictEqual([url]);
  });

  test("should not extract URLs from a different container", () => {
    expect.hasAssertions();

    const url = `${MOCK_BLOB_BASE_URL}/${AzureContainer.ClickerAssets}/1`;

    expect(extractBlobUrls(`${url}"`)).toStrictEqual([]);
  });

  test("should stop at the escaped quote when the URL is embedded in JSON-serialized content", () => {
    expect.hasAssertions();

    const url = `${containerUrl}/1`;

    expect(extractBlobUrls(JSON.stringify({ html: `<img src="${url}">` }))).toStrictEqual([url]);
  });
});
