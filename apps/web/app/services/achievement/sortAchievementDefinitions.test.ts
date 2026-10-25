import type { AchievementDefinitionEntry } from "#shared/models/achievement/AchievementDefinitionEntry";
import type { AchievementName } from "@esposter/db-schema";

import { AchievementSort } from "@/models/achievement/AchievementSort";
import { sortAchievementDefinitions } from "@/services/achievement/sortAchievementDefinitions";
import { EmailAchievementName, MessageAchievementName } from "@esposter/db-schema";
import { describe, expect, test } from "vitest";

describe(sortAchievementDefinitions, () => {
  // Category order is the order the definitions arrive in, so the common one comes first
  const definitions = [
    { name: EmailAchievementName.EmailMarketer },
    { name: MessageAchievementName.EssayWriter },
  ] as AchievementDefinitionEntry[];
  const achievementRarities = {
    [EmailAchievementName.EmailMarketer]: 50,
    [MessageAchievementName.EssayWriter]: 1,
  } as Record<AchievementName, number>;

  test("keeps the category order for the category sort, whatever the rarities", () => {
    expect.hasAssertions();

    expect(sortAchievementDefinitions(definitions, AchievementSort.Category, achievementRarities)).toStrictEqual(
      definitions,
    );
  });

  test("keeps the category order for rarest first until the rarity read lands", () => {
    expect.hasAssertions();

    expect(sortAchievementDefinitions(definitions, AchievementSort.RarestFirst)).toStrictEqual(definitions);
  });

  test("lists the lowest percentage first for rarest first", () => {
    expect.hasAssertions();

    const sorted = sortAchievementDefinitions(definitions, AchievementSort.RarestFirst, achievementRarities);

    expect(sorted.map(({ name }) => name)).toStrictEqual([
      MessageAchievementName.EssayWriter,
      EmailAchievementName.EmailMarketer,
    ]);
  });
});
