import type { HostedAssetLock, HostedAssetName } from "hosted-assets";

import { getLockRefs } from "#src/services/hostedAssets/getLockRefs";
import { getHostedAssetUrl } from "hosted-assets";
import { describe, expect, test } from "vitest";

const createIndex = (scope: string, hash: string) => ({ bytes: 0, extension: ".json", scope, sha256: hash });

describe(getLockRefs, () => {
  const baseUrl = "https://bucket.example/public-genshin-assets";
  const sha256 = "a".repeat(64);
  const entrySha256 = "b".repeat(64);
  const ENGLISH_INDEX_KEY = "profile/English";
  const toUrl = (name: HostedAssetName) => getHostedAssetUrl(baseUrl, name);

  // A lock entry is named by its own scope and extension, which need not match its key, so the walk and a reader of
  // The same entry fetch the same url
  test("names an object by its entry's scope and extension, not by its key", async () => {
    expect.hasAssertions();

    const lock: HostedAssetLock = {
      indexes: {},
      objects: { "stats/weapons": { bytes: 0, extension: ".webp", scope: "stats", sha256 } },
    };
    const { objects } = await getLockRefs([lock], () => Promise.reject(new Error(" ")));

    expect(objects.map((name) => toUrl(name))).toStrictEqual([`${baseUrl}/stats/${sha256}.webp`]);
  });

  // An index's entries are stored under the index's own scope, so the walk names them as the reader fetches them
  test("names an index's entries by the index's scope and extension, not by its key", async () => {
    expect.hasAssertions();

    const lock: HostedAssetLock = { indexes: { [ENGLISH_INDEX_KEY]: createIndex("profile", sha256) }, objects: {} };
    const { objects } = await getLockRefs([lock], () => Promise.resolve({ "10000002": entrySha256 }));

    expect(objects.map((name) => toUrl(name))).toStrictEqual([`${baseUrl}/profile/${entrySha256}.json`]);
  });

  // The index reads are the one fan-out a walk makes, so each caller's limit must bound them
  test("reads no more indexes at once than the concurrency it is given", async () => {
    expect.hasAssertions();

    const lock: HostedAssetLock = {
      indexes: {
        [ENGLISH_INDEX_KEY]: createIndex("profile", sha256),
        "profile/Japanese": createIndex("profile", entrySha256),
        "profile/Korean": createIndex("profile", "c".repeat(64)),
      },
      objects: {},
    };
    let inFlight = 0;
    let peakInFlight = 0;
    const readIndex = async () => {
      inFlight++;
      peakInFlight = Math.max(peakInFlight, inFlight);
      await Promise.resolve();
      inFlight--;
      return {};
    };

    await getLockRefs([lock], readIndex, 1);

    expect(peakInFlight).toBe(1);
  });
});
