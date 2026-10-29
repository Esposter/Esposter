import { CHARACTER_MODEL_PATH, CHARACTER_TERMS_PATH } from "#src/services/character/constants";
import { createCharacterPackCacheStub } from "#src/services/character/createCharacterPackCacheStub.test";
import { downloadCharacterPackFiles } from "#src/services/character/downloadCharacterPackFiles";
import { listHeldCharacterPackUrls } from "#src/services/character/listHeldCharacterPackUrls";
import { planCharacterPackDownload } from "#src/services/character/planCharacterPackDownload";
import { noop } from "@esposter/shared";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

describe(downloadCharacterPackFiles, () => {
  const gameDataBaseUrl = "http://a.test";
  const modelUrl = "http://a.test/characterPacks/1/model.pmx?v=0000000000000000";
  const termsUrl = "http://a.test/characterPacks/1/terms.txt?v=0000000000000000";
  const modelText = "model";
  const termsText = "terms";
  const failedMessage = "Invalid operation: Read, name: terms.txt, failed after its attempts";
  const index = {
    avatars: [
      {
        avatarId: 1,
        files: [
          { bytes: 5, path: CHARACTER_MODEL_PATH, sha256: "0".repeat(64) },
          { bytes: 5, path: CHARACTER_TERMS_PATH, sha256: "0".repeat(64) },
        ],
        name: "a",
      },
    ],
  };
  const fetchSpy = vi.spyOn(globalThis, "fetch");
  // The host answers the model, and fails the terms file with a server error until a test lets it through
  let isTermsServed: boolean;

  beforeEach(() => {
    vi.useFakeTimers({ now: 0 });
    isTermsServed = false;
    fetchSpy.mockImplementation(async (url) => {
      if (url === termsUrl && !isTermsServed) return new Response(null, { status: 500 });
      return new Response(url === modelUrl ? modelText : termsText);
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    fetchSpy.mockClear();
  });

  test("Retry fetches only what is missing", async () => {
    expect.hasAssertions();

    const cache = createCharacterPackCacheStub();
    const firstPlan = planCharacterPackDownload(index, gameDataBaseUrl, new Set());
    const firstRun = downloadCharacterPackFiles(cache, firstPlan.files, noop);
    await vi.runAllTimersAsync();
    const firstError = await firstRun.match(noop, (error) => error);
    fetchSpy.mockClear();
    isTermsServed = true;

    const retryPlan = planCharacterPackDownload(index, gameDataBaseUrl, await listHeldCharacterPackUrls(cache));
    const retryRun = downloadCharacterPackFiles(cache, retryPlan.files, noop);
    await vi.runAllTimersAsync();
    const retryError = await retryRun.match(noop, (error) => error);

    expect(firstError?.message).toBe(failedMessage);
    expect(retryPlan.files.map(({ path }) => path)).toStrictEqual([CHARACTER_TERMS_PATH]);
    expect(fetchSpy).toHaveBeenCalledExactlyOnceWith(termsUrl, expect.any(Object));
    expect(retryError).toBeUndefined();
  });

  test("Failure never enters the world without the model", async () => {
    expect.hasAssertions();

    const cache = createCharacterPackCacheStub();
    const plan = planCharacterPackDownload(index, gameDataBaseUrl, new Set());
    const run = downloadCharacterPackFiles(cache, plan.files, noop);
    await vi.runAllTimersAsync();
    const error = await run.match(noop, (error) => error);

    expect(error?.message).toBe(failedMessage);
    expect(fetchSpy.mock.calls.filter(([url]) => url === termsUrl)).toHaveLength(3);
    expect(await cache.match(termsUrl)).toBeUndefined();
  });
});
