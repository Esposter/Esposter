import { NameTextLoaderMap } from "#src/services/character/NameTextLoaderMap";
import { GameLanguage } from "genshin-text";
import { describe, expect, test } from "vitest";

const dataFiles = import.meta.glob(["#src/data/**/*.json", "#src/generated/**/*.json", "!#src/generated/nameText/**"], {
  eager: true,
  import: "default",
});

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
  test("every nameTextId in the world's data files is in the English name chunk", async () => {
    expect.hasAssertions();
    const names = await NameTextLoaderMap[GameLanguage.English]();
    const textIds = new Set<string>();
    for (const value of Object.values(dataFiles)) collectNameTextIds(value, textIds);
    expect([...textIds].filter((textId) => names[textId] === undefined)).toStrictEqual([]);
  });
});
