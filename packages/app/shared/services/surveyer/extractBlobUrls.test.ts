import type { OmitIndexSignature } from "type-fest";

import { AzureContainer } from "#shared/models/azure/blob/AzureContainer";
import { extractBlobUrls } from "#shared/services/surveyer/extractBlobUrls"; // Adjust path
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";

describe(extractBlobUrls, () => {
  const MOCK_AZURE_BLOB_URL = "https://testaccount.blob.core.windows.net";
  const MOCK_BLOB_URL = `${MOCK_AZURE_BLOB_URL}/${AzureContainer.SurveyerAssets}`;

  beforeAll(() => {
    vi.stubEnv<keyof OmitIndexSignature<typeof process.env>>("AZURE_BLOB_URL", MOCK_AZURE_BLOB_URL);
  });

  afterAll(() => {
    vi.unstubAllEnvs();
  });

  test("should return an empty array for an empty model string", () => {
    expect.hasAssertions();
    expect(extractBlobUrls("")).toStrictEqual([]);
  });

  test("should return an empty array if no matching blob URLs are found", () => {
    expect.hasAssertions();

    expect(extractBlobUrls("https://google.com.au")).toStrictEqual([]);
  });

  test("should extract a single matching blob URL", () => {
    expect.hasAssertions();

    expect(extractBlobUrls(MOCK_BLOB_URL)).toStrictEqual([MOCK_BLOB_URL]);
  });

  test("should extract multiple unique matching blob URLs", () => {
    expect.hasAssertions();

    const url1 = `${MOCK_BLOB_URL}/1`;
    const url2 = `${MOCK_BLOB_URL}/2`;

    expect(extractBlobUrls(`${url1}"${url2}`)).toStrictEqual([url1, url2]);
  });

  test("should extract only unique URLs if duplicates are present", () => {
    expect.hasAssertions();

    expect(extractBlobUrls(`${MOCK_BLOB_URL}"${MOCK_BLOB_URL}`)).toStrictEqual([MOCK_BLOB_URL]);
  });

  test("should extract URLs correctly when they end", () => {
    expect.hasAssertions();

    expect(extractBlobUrls(`${MOCK_BLOB_URL}"`)).toStrictEqual([MOCK_BLOB_URL]);
  });

  test("should extract URLs correctly when they end (JSON escaped)", () => {
    expect.hasAssertions();

    expect(extractBlobUrls(`${MOCK_BLOB_URL}\\`)).toStrictEqual([MOCK_BLOB_URL]);
  });

  test("should extract URLs correctly when they have query parameters (SAS tokens, etc.)", () => {
    expect.hasAssertions();

    expect(extractBlobUrls(`${MOCK_BLOB_URL}?`)).toStrictEqual([MOCK_BLOB_URL]);
  });

  test("should not extract URLs from a different container", () => {
    expect.hasAssertions();

    expect(extractBlobUrls(`${MOCK_AZURE_BLOB_URL}/`)).toStrictEqual([]);
  });
});
