import { extractBlobUrls } from "#shared/services/surveyer/extractBlobUrls";
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";

describe(extractBlobUrls, async () => {
  const mocks = await vi.hoisted(async () => {
    const blobUrl = "https://mockaccount.blob.core.windows.net";
    const AzureContainer = (await import("#shared/models/azure/blob/AzureContainer")).AzureContainer;
    return {
      blobUrl,
      containerUrl: `${blobUrl}/${AzureContainer.SurveyerAssets}`,
    };
  });

  beforeAll(() => {
    vi.mock("#shared/util/azure/getBlobUrl", () => ({
      getBlobUrl: () => mocks.blobUrl,
    }));
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

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

    expect(extractBlobUrls(`${mocks.containerUrl}"`)).toStrictEqual([mocks.containerUrl]);
  });

  test("should extract multiple unique matching blob URLs", () => {
    expect.hasAssertions();

    const url1 = `${mocks.containerUrl}/1`;
    const url2 = `${mocks.containerUrl}/2`;

    expect(extractBlobUrls(`${url1}"${url2}"`)).toStrictEqual([url1, url2]);
  });

  test("should extract only unique URLs if duplicates are present", () => {
    expect.hasAssertions();

    expect(extractBlobUrls(`${mocks.containerUrl}"${mocks.containerUrl}"`)).toStrictEqual([mocks.containerUrl]);
  });

  test("should not extract URLs from a different container", () => {
    expect.hasAssertions();

    expect(extractBlobUrls(`${mocks.blobUrl}"`)).toStrictEqual([]);
  });
});
