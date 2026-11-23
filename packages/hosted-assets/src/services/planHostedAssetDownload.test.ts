import type { HostedAssetDownloadFile } from "#src/models/HostedAssetDownloadFile";

import { planHostedAssetDownload } from "#src/services/planHostedAssetDownload";
import { describe, expect, test } from "vitest";

describe(planHostedAssetDownload, () => {
  const sha256 = "0".repeat(64);
  const republishedSha256 = "1".repeat(64);
  const modelUrl = `http://a.test/characters/1/model.pmx?sha256=${sha256}`;
  const termsUrl = `http://a.test/characters/1/terms.txt?sha256=${sha256}`;
  const republishedModelUrl = `http://a.test/characters/1/model.pmx?sha256=${republishedSha256}`;
  const modelFile: HostedAssetDownloadFile = { bytes: 1, path: "model.pmx", url: modelUrl };
  const termsFile: HostedAssetDownloadFile = { bytes: 2, path: "terms.txt", url: termsUrl };

  test("first visit downloads every file", () => {
    expect.hasAssertions();

    const plan = planHostedAssetDownload([modelFile, termsFile], new Set());

    expect(plan).toStrictEqual({ files: [modelFile, termsFile], pendingBytes: 3 });
  });

  test("returning visit downloads nothing", () => {
    expect.hasAssertions();

    const plan = planHostedAssetDownload([modelFile, termsFile], new Set([modelUrl, termsUrl]));

    expect(plan).toStrictEqual({ files: [], pendingBytes: 0 });
  });

  test("republished file is fetched again", () => {
    expect.hasAssertions();

    const republishedModelFile: HostedAssetDownloadFile = { ...modelFile, url: republishedModelUrl };

    const plan = planHostedAssetDownload([republishedModelFile, termsFile], new Set([modelUrl, termsUrl]));

    expect(plan).toStrictEqual({ files: [republishedModelFile], pendingBytes: 1 });
  });
});
