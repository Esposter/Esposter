import type { HostedAssetDownloadFile } from "#src/models/HostedAssetDownloadFile";

import { TEST_CHANGED_MODEL_URL, TEST_MODEL_URL, TEST_TERMS_URL } from "#src/services/constants.test";
import { planHostedAssetDownload } from "#src/services/planHostedAssetDownload";
import { describe, expect, test } from "vitest";

describe(planHostedAssetDownload, () => {
  const modelFile: HostedAssetDownloadFile = { bytes: 1, path: "model.pmx", url: TEST_MODEL_URL };
  const termsFile: HostedAssetDownloadFile = { bytes: 2, path: "terms.txt", url: TEST_TERMS_URL };

  test("first visit downloads every file", () => {
    expect.hasAssertions();

    const plan = planHostedAssetDownload([modelFile, termsFile], new Set());

    expect(plan).toStrictEqual({ files: [modelFile, termsFile], pendingBytes: 3 });
  });

  test("returning visit downloads nothing", () => {
    expect.hasAssertions();

    const plan = planHostedAssetDownload([modelFile, termsFile], new Set([TEST_MODEL_URL, TEST_TERMS_URL]));

    expect(plan).toStrictEqual({ files: [], pendingBytes: 0 });
  });

  test("republished file is fetched again", () => {
    expect.hasAssertions();

    const republishedModelFile: HostedAssetDownloadFile = { ...modelFile, url: TEST_CHANGED_MODEL_URL };

    const plan = planHostedAssetDownload([republishedModelFile, termsFile], new Set([TEST_MODEL_URL, TEST_TERMS_URL]));

    expect(plan).toStrictEqual({ files: [republishedModelFile], pendingBytes: 1 });
  });
});
