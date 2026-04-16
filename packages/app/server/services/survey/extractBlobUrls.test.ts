import { extractBlobUrls } from "@@/server/services/survey/extractBlobUrls";
import { AzureContainer } from "@esposter/db-schema";
import { describe, expect, test, vi } from "vitest";

const mocks = await vi.hoisted(async () => {
  const containerBaseUrl = "https://mockaccount.blob.core.windows.net";
  const AzureContainer = (await import("@esposter/db-schema")).AzureContainer;
  return {
    containerBaseUrl,
    containerUrl: `${containerBaseUrl}/${AzureContainer.SurveyAssets}`,
  };
});

vi.mock(import("@@/server/composables/azure/container/useContainerBaseUrl"), () => ({
  useContainerBaseUrl: () => mocks.containerBaseUrl,
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

    const url = `${mocks.containerUrl}/1`;

    expect(extractBlobUrls(`${url}"`)).toStrictEqual([url]);
  });

  test("should extract multiple unique matching blob URLs", () => {
    expect.hasAssertions();

    const url1 = `${mocks.containerUrl}/1`;
    const url2 = `${mocks.containerUrl}/2`;

    expect(extractBlobUrls(`${url1}"${url2}"`)).toStrictEqual([url1, url2]);
  });

  test("should extract only unique URLs if duplicates are present", () => {
    expect.hasAssertions();

    const url = `${mocks.containerUrl}/1`;

    expect(extractBlobUrls(`${url}"${url}"`)).toStrictEqual([url]);
  });

  test("should not extract URLs from a different container", () => {
    expect.hasAssertions();

    const url = `${mocks.containerBaseUrl}/${AzureContainer.ClickerAssets}/1`;

    expect(extractBlobUrls(`${url}"`)).toStrictEqual([]);
  });
});
