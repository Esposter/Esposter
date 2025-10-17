import { extractBlobUrls } from "@@/server/services/survey/extractBlobUrls";
import { AzureContainer } from "@esposter/db-schema";
import { describe, expect, test, vi } from "vitest";

const mocks = await vi.hoisted(async () => {
  const azureContainerBaseUrl = "https://mockaccount.blob.core.windows.net";
  const AzureContainer = (await import("@esposter/db-schema")).AzureContainer;
  return {
    azureContainerBaseUrl,
    azureContainerUrl: `${azureContainerBaseUrl}/${AzureContainer.SurveyAssets}`,
  };
});

vi.mock(import("#shared/services/azure/container/getAzureContainerBaseUrl"), () => ({
  getAzureContainerBaseUrl: () => mocks.azureContainerBaseUrl,
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

    const url = `${mocks.azureContainerUrl}/1`;

    expect(extractBlobUrls(`${url}"`)).toStrictEqual([url]);
  });

  test("should extract multiple unique matching blob URLs", () => {
    expect.hasAssertions();

    const url1 = `${mocks.azureContainerUrl}/1`;
    const url2 = `${mocks.azureContainerUrl}/2`;

    expect(extractBlobUrls(`${url1}"${url2}"`)).toStrictEqual([url1, url2]);
  });

  test("should extract only unique URLs if duplicates are present", () => {
    expect.hasAssertions();

    const url = `${mocks.azureContainerUrl}/1`;

    expect(extractBlobUrls(`${url}"${url}"`)).toStrictEqual([url]);
  });

  test("should not extract URLs from a different container", () => {
    expect.hasAssertions();

    const url = `${mocks.azureContainerBaseUrl}/${AzureContainer.ClickerAssets}/1`;

    expect(extractBlobUrls(`${url}"`)).toStrictEqual([]);
  });
});
