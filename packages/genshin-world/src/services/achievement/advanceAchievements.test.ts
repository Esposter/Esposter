import type { Achievement } from "#src/models/achievement/Achievement";

import { AchievementEventKind } from "#src/models/achievement/AchievementEventKind";
import { advanceAchievements } from "#src/services/achievement/advanceAchievements";
import { describe, expect, test } from "vitest";

const craft = (quantity: number, targetId: string) => ({ kind: AchievementEventKind.ItemCrafted, quantity, targetId });
const defeat = (targetId: string) => ({ kind: AchievementEventKind.MonsterDefeated, quantity: 1, targetId });

describe(advanceAchievements, () => {
  const EPOCH = Temporal.Instant.fromEpochMilliseconds(0);
  const PRIMOGEMS = 5;
  const FIRST_QUEST_ID = "11";
  const SECOND_QUEST_ID = "12";
  const MAIN_QUEST_ID = "21";
  const CHEST_ID = "31";
  const COUNTED_ID = 1;
  const TIER_ID = 2;
  // An OR trigger over two quests that counts both finishing, the second achievement the tier after it
  const counted: Achievement = {
    categoryId: 1,
    descriptionTextId: "",
    id: COUNTED_ID,
    isHidden: false,
    orderId: 1,
    preStageAchievementId: 0,
    primogems: PRIMOGEMS,
    progress: 2,
    titleTextId: "",
    trigger: { parameters: [[FIRST_QUEST_ID, SECOND_QUEST_ID]], type: "TRIGGER_FINISH_QUEST_OR" },
  };
  const tier: Achievement = {
    ...counted,
    id: TIER_ID,
    preStageAchievementId: COUNTED_ID,
    primogems: 0,
    progress: 1,
    trigger: { parameters: [[SECOND_QUEST_ID]], type: "TRIGGER_FINISH_QUEST_AND" },
  };

  test("should count a quest its trigger names once more, and pay the Primogems once the count is reached", () => {
    expect.hasAssertions();
    const firstAdvance = advanceAchievements(
      [counted],
      new Map(),
      { kind: AchievementEventKind.QuestFinished, quantity: 1, targetId: FIRST_QUEST_ID },
      EPOCH,
    );
    expect(firstAdvance).toStrictEqual({
      primogems: 0,
      progressMap: new Map([[COUNTED_ID, { count: 1, countedTargetIds: [FIRST_QUEST_ID] }]]),
    });
    const secondAdvance = advanceAchievements(
      [counted],
      firstAdvance.progressMap,
      { kind: AchievementEventKind.QuestFinished, quantity: 1, targetId: SECOND_QUEST_ID },
      EPOCH,
    );
    expect(secondAdvance).toStrictEqual({
      primogems: PRIMOGEMS,
      progressMap: new Map([[COUNTED_ID, { count: 2, finishedAt: EPOCH }]]),
    });
  });

  test("an OR trigger counts each named quest once", () => {
    expect.hasAssertions();
    const fiveQuests: Achievement = { ...counted, progress: 5 };
    const firstAdvance = advanceAchievements(
      [fiveQuests],
      new Map(),
      { kind: AchievementEventKind.QuestFinished, quantity: 1, targetId: FIRST_QUEST_ID },
      EPOCH,
    );
    const repeatedAdvance = advanceAchievements(
      [fiveQuests],
      firstAdvance.progressMap,
      { kind: AchievementEventKind.QuestFinished, quantity: 1, targetId: FIRST_QUEST_ID },
      EPOCH,
    );
    expect(repeatedAdvance).toStrictEqual(firstAdvance);
  });

  test("an unwatched trigger leaves its achievements at zero", () => {
    expect.hasAssertions();
    const unwatched: Achievement = {
      ...counted,
      trigger: { parameters: [[FIRST_QUEST_ID]], type: "TRIGGER_TALK_NUM" },
    };
    expect(
      advanceAchievements(
        [counted, unwatched],
        new Map(),
        { kind: AchievementEventKind.ParentQuestFinished, quantity: 1, targetId: FIRST_QUEST_ID },
        EPOCH,
      ),
    ).toStrictEqual({ primogems: 0, progressMap: new Map() });
    expect(
      advanceAchievements(
        [counted],
        new Map(),
        { kind: AchievementEventKind.QuestFinished, quantity: 1, targetId: "1" },
        EPOCH,
      ),
    ).toStrictEqual({ primogems: 0, progressMap: new Map() });
    expect(
      advanceAchievements(
        [unwatched],
        new Map(),
        { kind: AchievementEventKind.QuestFinished, quantity: 1, targetId: FIRST_QUEST_ID },
        EPOCH,
      ),
    ).toStrictEqual({ primogems: 0, progressMap: new Map() });
  });

  test("should hold an achievement until the tier before it is done", () => {
    expect.hasAssertions();
    const secondQuestEvent = { kind: AchievementEventKind.QuestFinished, quantity: 1, targetId: SECOND_QUEST_ID };
    const held = advanceAchievements([counted, tier], new Map(), secondQuestEvent, EPOCH);
    expect(held.progressMap).toStrictEqual(new Map([[COUNTED_ID, { count: 1, countedTargetIds: [SECOND_QUEST_ID] }]]));
    const tierFinishing = advanceAchievements(
      [counted, tier],
      held.progressMap,
      { kind: AchievementEventKind.QuestFinished, quantity: 1, targetId: FIRST_QUEST_ID },
      EPOCH,
    );
    const tiered = advanceAchievements([counted, tier], tierFinishing.progressMap, secondQuestEvent, EPOCH);
    expect(tiered.progressMap.get(TIER_ID)).toStrictEqual({ count: 1, finishedAt: EPOCH });
  });

  test("a parent-quest trigger counts when its main quest finishes", () => {
    expect.hasAssertions();
    const parentQuest: Achievement = {
      ...counted,
      id: COUNTED_ID,
      progress: 1,
      trigger: { parameters: [[MAIN_QUEST_ID]], type: "TRIGGER_FINISH_PARENT_QUEST_AND" },
    };
    expect(
      advanceAchievements(
        [parentQuest],
        new Map(),
        { kind: AchievementEventKind.ParentQuestFinished, quantity: 1, targetId: MAIN_QUEST_ID },
        EPOCH,
      ),
    ).toStrictEqual({ primogems: PRIMOGEMS, progressMap: new Map([[COUNTED_ID, { count: 1, finishedAt: EPOCH }]]) });
  });

  test("an exploring trigger counts a doing once its rule is called", () => {
    expect.hasAssertions();
    const chest: Achievement = {
      ...counted,
      progress: 2,
      trigger: { parameters: [[CHEST_ID]], type: "TRIGGER_OPEN_WORLD_CHEST" },
    };
    expect(
      advanceAchievements(
        [chest],
        new Map(),
        { kind: AchievementEventKind.ChestOpened, quantity: 1, targetId: CHEST_ID },
        EPOCH,
      ),
    ).toStrictEqual({ primogems: 0, progressMap: new Map([[COUNTED_ID, { count: 1, countedTargetIds: [CHEST_ID] }]]) });
  });

  test("a level trigger takes the level its event reached, not one per event", () => {
    expect.hasAssertions();
    const OFFERING_ID = "7";
    const levelled: Achievement = {
      ...counted,
      progress: 1,
      trigger: { parameters: [[OFFERING_ID], ["3"]], type: "TRIGGER_OFFERING_LEVEL" },
    };
    const reachedTwo = advanceAchievements(
      [levelled],
      new Map(),
      { kind: AchievementEventKind.OfferingLevelReached, quantity: 2, targetId: OFFERING_ID },
      EPOCH,
    );
    expect(reachedTwo).toStrictEqual({ primogems: 0, progressMap: new Map([[COUNTED_ID, { count: 2 }]]) });
    const reachedThree = advanceAchievements(
      [levelled],
      reachedTwo.progressMap,
      { kind: AchievementEventKind.OfferingLevelReached, quantity: 3, targetId: OFFERING_ID },
      EPOCH,
    );
    expect(reachedThree).toStrictEqual({
      primogems: PRIMOGEMS,
      progressMap: new Map([[COUNTED_ID, { count: 3, finishedAt: EPOCH }]]),
    });
  });

  test("an any-target trigger counts each doing, whichever id it names", () => {
    expect.hasAssertions();
    const OTHER_CHEST_ID = "32";
    const anyChest: Achievement = {
      ...counted,
      progress: 2,
      trigger: { parameters: [[]], type: "TRIGGER_OPEN_WORLD_CHEST" },
    };
    const firstOpening = advanceAchievements(
      [anyChest],
      new Map(),
      { kind: AchievementEventKind.ChestOpened, quantity: 1, targetId: CHEST_ID },
      EPOCH,
    );
    expect(firstOpening).toStrictEqual({ primogems: 0, progressMap: new Map([[COUNTED_ID, { count: 1 }]]) });
    const secondOpening = advanceAchievements(
      [anyChest],
      firstOpening.progressMap,
      { kind: AchievementEventKind.ChestOpened, quantity: 1, targetId: OTHER_CHEST_ID },
      EPOCH,
    );
    expect(secondOpening).toStrictEqual({
      primogems: PRIMOGEMS,
      progressMap: new Map([[COUNTED_ID, { count: 2, finishedAt: EPOCH }]]),
    });
  });

  test("a multi-id AND trigger counts each named id once, and is done when every named id is counted", () => {
    expect.hasAssertions();
    const FIRST_MONSTER_ID = "41";
    const SECOND_MONSTER_ID = "42";
    const THIRD_MONSTER_ID = "43";
    const everyMonster: Achievement = {
      ...counted,
      progress: 1,
      trigger: {
        parameters: [[FIRST_MONSTER_ID, SECOND_MONSTER_ID, THIRD_MONSTER_ID]],
        type: "TRIGGER_BATTLE_FOR_MONSTER_DIE_AND",
      },
    };
    const firstDefeat = advanceAchievements([everyMonster], new Map(), defeat(FIRST_MONSTER_ID), EPOCH);
    expect(firstDefeat).toStrictEqual({
      primogems: 0,
      progressMap: new Map([[COUNTED_ID, { count: 1, countedTargetIds: [FIRST_MONSTER_ID] }]]),
    });
    expect(advanceAchievements([everyMonster], firstDefeat.progressMap, defeat(FIRST_MONSTER_ID), EPOCH)).toStrictEqual(
      firstDefeat,
    );
    const secondDefeat = advanceAchievements([everyMonster], firstDefeat.progressMap, defeat(SECOND_MONSTER_ID), EPOCH);
    const thirdDefeat = advanceAchievements([everyMonster], secondDefeat.progressMap, defeat(THIRD_MONSTER_ID), EPOCH);
    expect(thirdDefeat).toStrictEqual({
      primogems: PRIMOGEMS,
      progressMap: new Map([[COUNTED_ID, { count: 3, finishedAt: EPOCH }]]),
    });
  });

  test("a two-slot trigger counts only a doing that matches both its target slot and its scope slot", () => {
    expect.hasAssertions();
    const REGION_ID = "1";
    const OTHER_REGION_ID = "2";
    const chestInRegion: Achievement = {
      ...counted,
      progress: 1,
      trigger: { parameters: [[CHEST_ID], [REGION_ID]], type: "TRIGGER_OPEN_WORLD_CHEST" },
    };
    const openChest = (scopeId: string) => ({
      kind: AchievementEventKind.ChestOpened,
      quantity: 1,
      scopeId,
      targetId: CHEST_ID,
    });
    expect(advanceAchievements([chestInRegion], new Map(), openChest(OTHER_REGION_ID), EPOCH)).toStrictEqual({
      primogems: 0,
      progressMap: new Map(),
    });
    expect(advanceAchievements([chestInRegion], new Map(), openChest(REGION_ID), EPOCH)).toStrictEqual({
      primogems: PRIMOGEMS,
      progressMap: new Map([[COUNTED_ID, { count: 1, finishedAt: EPOCH }]]),
    });
  });

  test("a crafting trigger counts the items its crafts make, by the combine type it names", () => {
    expect.hasAssertions();
    const COMBINE_TYPE = "7";
    const OTHER_COMBINE_TYPE = "9";
    const craftItems: Achievement = {
      ...counted,
      progress: 5,
      trigger: { parameters: [[COMBINE_TYPE]], type: "TRIGGER_COMBINE_ITEM" },
    };
    const firstCraft = advanceAchievements([craftItems], new Map(), craft(3, COMBINE_TYPE), EPOCH);
    expect(firstCraft).toStrictEqual({ primogems: 0, progressMap: new Map([[COUNTED_ID, { count: 3 }]]) });
    expect(
      advanceAchievements([craftItems], firstCraft.progressMap, craft(2, OTHER_COMBINE_TYPE), EPOCH),
    ).toStrictEqual(firstCraft);
    expect(advanceAchievements([craftItems], firstCraft.progressMap, craft(2, COMBINE_TYPE), EPOCH)).toStrictEqual({
      primogems: PRIMOGEMS,
      progressMap: new Map([[COUNTED_ID, { count: 5, finishedAt: EPOCH }]]),
    });
  });

  test("a monster trigger naming one monster counts every defeat of it, up to its progress", () => {
    expect.hasAssertions();
    const MONSTER_ID = "51";
    const OTHER_MONSTER_ID = "52";
    const defeatMonsters: Achievement = {
      ...counted,
      progress: 3,
      trigger: { parameters: [[MONSTER_ID]], type: "TRIGGER_BATTLE_FOR_MONSTER_DIE_OR" },
    };
    const firstDefeat = advanceAchievements([defeatMonsters], new Map(), defeat(MONSTER_ID), EPOCH);
    const secondDefeat = advanceAchievements([defeatMonsters], firstDefeat.progressMap, defeat(MONSTER_ID), EPOCH);
    expect(
      advanceAchievements([defeatMonsters], secondDefeat.progressMap, defeat(OTHER_MONSTER_ID), EPOCH),
    ).toStrictEqual(secondDefeat);
    expect(secondDefeat.progressMap).toStrictEqual(new Map([[COUNTED_ID, { count: 2 }]]));
    expect(advanceAchievements([defeatMonsters], secondDefeat.progressMap, defeat(MONSTER_ID), EPOCH)).toStrictEqual({
      primogems: PRIMOGEMS,
      progressMap: new Map([[COUNTED_ID, { count: 3, finishedAt: EPOCH }]]),
    });
  });

  test("a material trigger counts the quantity the event gains", () => {
    expect.hasAssertions();
    const material: Achievement = {
      ...counted,
      progress: 10,
      trigger: { parameters: [[CHEST_ID, FIRST_QUEST_ID]], type: "TRIGGER_OBTAIN_MATERIAL_NUM" },
    };
    expect(
      advanceAchievements(
        [material],
        new Map(),
        { kind: AchievementEventKind.MaterialObtained, quantity: 4, targetId: CHEST_ID },
        EPOCH,
      ),
    ).toStrictEqual({ primogems: 0, progressMap: new Map([[COUNTED_ID, { count: 4 }]]) });
  });

  test("a trigger counts only the target named in its own slot", () => {
    expect.hasAssertions();
    const slotted: Achievement = {
      ...counted,
      trigger: { parameters: [[MAIN_QUEST_ID], [FIRST_QUEST_ID]], type: "TRIGGER_FINISH_PARENT_QUEST_AND" },
    };
    expect(
      advanceAchievements(
        [slotted],
        new Map(),
        { kind: AchievementEventKind.ParentQuestFinished, quantity: 1, targetId: FIRST_QUEST_ID },
        EPOCH,
      ),
    ).toStrictEqual({ primogems: 0, progressMap: new Map() });
  });

  test("a server-fired achievement advances when its own doing happens", () => {
    expect.hasAssertions();

    const ITEM_ID = "41";
    const obtained: Achievement = {
      ...counted,
      progress: 10,
      trigger: { parameters: [[ITEM_ID]], type: "TRIGGER_OBTAIN_ITEM_NUM" },
    };
    expect(
      advanceAchievements(
        [obtained],
        new Map(),
        { kind: AchievementEventKind.ItemObtained, quantity: 4, targetId: ITEM_ID },
        EPOCH,
      ),
    ).toStrictEqual({ primogems: 0, progressMap: new Map([[COUNTED_ID, { count: 4 }]]) });
  });

  test("a forge trigger counts a weapon forged at its named rarity, and no other", () => {
    expect.hasAssertions();

    const forged: Achievement = {
      ...counted,
      progress: 1,
      trigger: { parameters: [["4"]], type: "TRIGGER_FORGE_WEAPON" },
    };
    expect(
      advanceAchievements(
        [forged],
        new Map(),
        { kind: AchievementEventKind.WeaponForged, quantity: 1, targetId: "3" },
        EPOCH,
      ),
    ).toStrictEqual({ primogems: 0, progressMap: new Map() });
    expect(
      advanceAchievements(
        [forged],
        new Map(),
        { kind: AchievementEventKind.WeaponForged, quantity: 1, targetId: "4" },
        EPOCH,
      ),
    ).toStrictEqual({ primogems: PRIMOGEMS, progressMap: new Map([[COUNTED_ID, { count: 1, finishedAt: EPOCH }]]) });
  });
});
