import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { GameDataset } from "#src/models/data/GameDataset";
import { NameTextLoaderMap } from "#src/services/character/NameTextLoaderMap";
import { gameDataLock } from "#src/services/data/gameDataLock";
import { readGameDataObject } from "#src/services/data/readGameDataObject";
import { takeOne } from "@esposter/shared";
import { GameLanguage } from "genshin-text";
import { describe, expect, test } from "vitest";

// Adds the `nameTextId` of every row at any depth, as the writer's discovery does
const collectNameTextIds = (value: unknown, textIds: Set<string>): void => {
  if (Array.isArray(value)) {
    for (const item of value) collectNameTextIds(item, textIds);
    return;
  }
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value))
    if (key === "nameTextId") textIds.add(String(child));
    else collectNameTextIds(child, textIds);
};

describe("name text loader map", () => {
  // The text datasets hold the words a `nameTextId` points at, so they are never a source of one
  const TEXT_DATASETS: ReadonlySet<string> = new Set([
    GameDataset.AchievementText,
    GameDataset.ArchiveText,
    GameDataset.GcgText,
    GameDataset.NameText,
    GameDataset.QuestText,
  ]);
  const lockedKeys = new Set(Object.keys(gameDataLock.objects));
  // The authored data files the lock does not name, read from the bundle
  const authoredDataFiles = import.meta.glob("#src/data/**/*.json", { eager: true, import: "default" });

  // A cold mirror downloads the records the lock names outside the text datasets, past a test's default timeout
  test("every nameTextId in the world's data files is in the English name chunk", async () => {
    expect.hasAssertions();
    const names = await NameTextLoaderMap[GameLanguage.English](GAME_DATA_LOCAL_BASE_URL);
    const lockedObjects = await Promise.all(
      Object.entries(gameDataLock.objects)
        .filter(([key]) => !TEXT_DATASETS.has(takeOne(key.split("/"), 0)))
        .map(([, hash]) => readGameDataObject(GAME_DATA_LOCAL_BASE_URL, hash)),
    );
    const authoredObjects = Object.entries(authoredDataFiles)
      .filter(([path]) => !lockedKeys.has(path.replace(/^.*\/data\//u, "").replace(/\.json$/u, "")))
      .map(([, value]) => value);
    const textIds = new Set<string>();
    for (const value of [...lockedObjects, ...authoredObjects]) collectNameTextIds(value, textIds);
    expect([...textIds].filter((textId) => names[textId] === undefined)).toStrictEqual([]);
  }, 60_000);
});
