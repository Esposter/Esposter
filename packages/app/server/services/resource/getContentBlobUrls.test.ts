import { getContentBlobUrls } from "@@/server/services/resource/getContentBlobUrls";
import { AzureContainer } from "@esposter/db-schema";
import { MOCK_BLOB_BASE_URL } from "azure-mock";
import { describe, expect, test, vi } from "vitest";

const containerUrl = `${MOCK_BLOB_BASE_URL}/${AzureContainer.ResourceAssets}`;
const url = `${containerUrl}/a`;
const otherUrl = `${containerUrl}/b`;

vi.mock(import("@@/server/composables/azure/container/useContainerBaseUrl"), () => ({
  useContainerBaseUrl: () => MOCK_BLOB_BASE_URL,
}));

// Where each url ends is `useBlobUrlSearchRegex`'s behaviour and is covered there. What is left here is this
// Function's own: which leaves it reaches, and identity by path
describe(getContentBlobUrls, () => {
  test("should return an empty array when the content holds no blob url", () => {
    expect.hasAssertions();
    expect(getContentBlobUrls({ html: `<a href="https://github.com">` })).toStrictEqual([]);
  });

  test("should find urls in every string leaf, however deeply nested, in the order they are encountered", () => {
    expect.hasAssertions();
    expect(
      getContentBlobUrls({ html: `<img src="${url}">`, pages: [{ styles: `background:url(${otherUrl})` }] }),
    ).toStrictEqual([url, otherUrl]);
  });

  test("should return one entry per distinct url, however many leaves it appears in", () => {
    expect.hasAssertions();
    expect(getContentBlobUrls({ body: `<img src="${url}">`, preview: `<img src="${url}">` })).toStrictEqual([url]);
  });

  test("should identify a url by its path, dropping the SAS query it was last signed with", () => {
    expect.hasAssertions();
    expect(
      getContentBlobUrls({ body: `<img src="${url}?sv=2025-01-05&sig=a%2Fb">`, preview: `<img src="${url}?sig=c">` }),
    ).toStrictEqual([url]);
  });

  // A leaf reached only through the serialized form arrives escaped; reached through the structure it arrives raw
  test("should find a url in a leaf whose own text is JSON", () => {
    expect.hasAssertions();
    expect(getContentBlobUrls({ project: JSON.stringify({ html: `<img src="${url}">` }) })).toStrictEqual([url]);
  });
});
