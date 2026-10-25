import type { AchievementDefinitionEntry } from "#shared/models/achievement/AchievementDefinitionEntry";
import type { UserAchievementWithDefinition } from "@/models/achievement/UserAchievementWithDefinition";

import { AchievementStatus } from "@/models/achievement/AchievementStatus";
import { getAchievementListMap } from "@/services/achievement/getAchievementListMap";
import { EmailAchievementName, MessageAchievementName } from "@esposter/db-schema";
import { describe, expect, test } from "vitest";

const getNames = (definitions: AchievementDefinitionEntry[]) => definitions.map(({ name }) => name);

describe(getAchievementListMap, () => {
  const achievementDefinitions = [
    { name: EmailAchievementName.EmailMarketer },
    { name: MessageAchievementName.EssayWriter },
  ] as AchievementDefinitionEntry[];
  // The second row is progress without an unlock, which must count as locked
  const userAchievements = [
    { achievement: { name: EmailAchievementName.EmailMarketer }, unlockedAt: new Date(0) },
    { achievement: { name: MessageAchievementName.EssayWriter }, unlockedAt: null },
  ] as UserAchievementWithDefinition[];
  const listMap = getAchievementListMap(achievementDefinitions, userAchievements);

  test("splits the definitions and their rows into locked and unlocked by the row's timestamp", () => {
    expect.hasAssertions();

    expect(getNames(listMap[AchievementStatus.Locked].achievementDefinitions)).toStrictEqual([
      MessageAchievementName.EssayWriter,
    ]);
    expect(getNames(listMap[AchievementStatus.Unlocked].achievementDefinitions)).toStrictEqual([
      EmailAchievementName.EmailMarketer,
    ]);
    expect(listMap[AchievementStatus.Unlocked].userAchievements).toStrictEqual([userAchievements[0]]);
  });
});
