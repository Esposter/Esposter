import { gameDataLock } from "#src/services/data/gameDataLock";
import { GcgDeckLoaderMap } from "#src/services/gcg/GcgDeckLoaderMap";
import { describe, expect, test } from "vitest";

describe("gcgDeckLoaderMap", () => {
  const publishedDeckIds = Object.keys(gameDataLock.objects).flatMap((key) => {
    const deckId = /^gcg\/deck(\d+)$/u.exec(key)?.[1];
    return deckId === undefined ? [] : [Number(deckId)];
  });

  test("every deck the lock publishes has a loader", () => {
    expect.hasAssertions();
    expect(publishedDeckIds.filter((deckId) => !GcgDeckLoaderMap.has(deckId))).toStrictEqual([]);
  });

  test("every loader has a deck the lock publishes", () => {
    expect.hasAssertions();
    expect([...GcgDeckLoaderMap.keys()].filter((deckId) => !publishedDeckIds.includes(deckId))).toStrictEqual([]);
  });
});
