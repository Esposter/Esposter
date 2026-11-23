import type { HostedAssetDownloadFile } from "#src/models/HostedAssetDownloadFile";
import type { MockInstance } from "vitest";

import { TEST_MODEL_URL, TEST_TERMS_URL } from "#src/services/constants.test";
import { createHostedAssetCacheStub } from "#src/services/createHostedAssetCacheStub";
import { downloadHostedAssetFiles } from "#src/services/downloadHostedAssetFiles";
import { listHeldHostedAssetUrls } from "#src/services/listHeldHostedAssetUrls";
import { planHostedAssetDownload } from "#src/services/planHostedAssetDownload";
import { noop } from "@esposter/shared";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(downloadHostedAssetFiles, () => {
  const modelUrl = TEST_MODEL_URL;
  const termsUrl = TEST_TERMS_URL;
  const modelText = "model";
  const termsText = "terms";
  const failedMessage = "Invalid operation: Read, name: terms.txt, failed after its attempts";
  const files: HostedAssetDownloadFile[] = [
    { bytes: 5, path: "model.pmx", url: modelUrl },
    { bytes: 5, path: "terms.txt", url: termsUrl },
  ];
  // The host answers the model, and fails the terms file with a server error until a test lets it through
  let fetchSpy: MockInstance<typeof fetch>;
  let isTermsServed: boolean;

  beforeEach(() => {
    vi.useFakeTimers({ now: 0 });
    isTermsServed = false;
    fetchSpy = vi.spyOn(globalThis, "fetch");
    fetchSpy.mockImplementation((url) => {
      if (url === termsUrl && !isTermsServed) return Promise.resolve(new Response(null, { status: 500 }));
      return Promise.resolve(new Response(url === modelUrl ? modelText : termsText));
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  test("retry fetches only what is missing", async () => {
    expect.hasAssertions();

    const cache = createHostedAssetCacheStub();
    const firstPlan = planHostedAssetDownload(files, new Set());
    const firstRun = downloadHostedAssetFiles(cache, firstPlan.files, noop);
    await vi.runAllTimersAsync();
    const firstError = await firstRun.match(noop, (error) => error);
    fetchSpy.mockClear();
    isTermsServed = true;

    const retryPlan = planHostedAssetDownload(files, await listHeldHostedAssetUrls(cache));
    const retryRun = downloadHostedAssetFiles(cache, retryPlan.files, noop);
    await vi.runAllTimersAsync();
    const retryError = await retryRun.match(noop, (error) => error);

    expect(firstError?.message).toBe(failedMessage);
    expect(retryPlan.files.map(({ path }) => path)).toStrictEqual(["terms.txt"]);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    expect(fetchSpy.mock.calls[0]?.[0]).toBe(termsUrl);
    expect(Object.keys(fetchSpy.mock.calls[0]?.[1] ?? {})).toStrictEqual(["signal"]);
    expect(retryError).toBeUndefined();
  });

  test("a terms file that fails all its attempts is not cached, and the download reports the failure", async () => {
    expect.hasAssertions();

    const cache = createHostedAssetCacheStub();
    const plan = planHostedAssetDownload(files, new Set());
    const run = downloadHostedAssetFiles(cache, plan.files, noop);
    await vi.runAllTimersAsync();
    const error = await run.match(noop, (runError) => runError);

    expect(error?.message).toBe(failedMessage);
    expect(fetchSpy.mock.calls.filter(([url]) => url === termsUrl)).toHaveLength(3);
    await expect(cache.match(termsUrl)).resolves.toBeUndefined();
  });
});
