import type { Character } from "#src/models/character/Character";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { Quest } from "#src/models/quest/Quest";
import type { QuestProgress } from "#src/models/quest/QuestProgress";

import { useWorldQuestRewards } from "#src/composables/useWorldQuestRewards";
import { CHARACTER_EXP_TO_NEXT_LEVEL } from "#src/data/character/characterExpToNext";
import { CombatTalent } from "#src/models/character/CombatTalent";
import { Currency } from "#src/models/inventory/Currency";
import { MaterialType } from "#src/models/inventory/MaterialType";
import { QuestKind } from "#src/models/quest/QuestKind";
import { CHARACTER_EXP_ITEM_ID, EMPTY_INVENTORY, EMPTY_WALLET } from "#src/services/inventory/constants";
import { createWorldEvents } from "#src/services/world/createWorldEvents";
import { describe, expect, test, vi } from "vitest";
import { ref } from "vue";

// A made-up item and quest, since no record is copied into a test. Its rewards are Mora, a made-up item, Adventure EXP
// And the Character EXP one level at level one takes
const ITEM_ID = 900_001;
const ADVENTURE_EXP_ITEM_ID = 102;
const MAX_LEVEL = 20;
const MATERIAL_DATA: MaterialData = {
  id: ITEM_ID,
  materialType: MaterialType.Consume,
  nameTextId: "1",
  rank: 1,
  rarity: 1,
  stackLimit: 99,
};
const QUEST: Quest = {
  descriptionTextId: "",
  id: "1",
  kind: QuestKind.World,
  offerTalkIds: [],
  parentQuestIds: [],
  rewards: [
    { count: 2, itemId: 202 },
    { count: 3, itemId: ITEM_ID },
    { count: 40, itemId: ADVENTURE_EXP_ITEM_ID },
    { count: CHARACTER_EXP_TO_NEXT_LEVEL[0] ?? 0, itemId: CHARACTER_EXP_ITEM_ID },
  ],
  steps: [],
  talks: [],
  titleTextId: "",
};
const PROGRESS: QuestProgress = { objectiveCounts: [], stepIndex: 0 };
const CHARACTER: Character = {
  artifacts: [],
  ascension: 0,
  constellationCount: 0,
  friendshipExp: 0,
  id: 1,
  level: 1,
  stellaFortunaCount: 0,
  talentLevels: { [CombatTalent.ElementalBurst]: 1, [CombatTalent.ElementalSkill]: 1, [CombatTalent.NormalAttack]: 1 },
  weapon: { ascension: 0, experience: 0, id: 1, level: 1, refinement: 1 },
};
const BENCHED_CHARACTER: Character = { ...CHARACTER, id: 2 };

describe(useWorldQuestRewards, () => {
  test("finishing a quest grants its rewards", () => {
    expect.hasAssertions();
    const events = createWorldEvents();
    const inventory = ref<Inventory>({ ...EMPTY_INVENTORY });
    const wallet = ref<Wallet>({ ...EMPTY_WALLET });
    const characters = ref<Character[]>([CHARACTER, BENCHED_CHARACTER]);
    const gainAdventureExp = vi.fn<(amount: number) => void>();
    useWorldQuestRewards({
      characters,
      events,
      gainAdventureExp,
      getDeployedCharacterIds: () => [CHARACTER.id],
      getMaxLevel: () => MAX_LEVEL,
      inventory,
      materialDataMap: new Map([[ITEM_ID, MATERIAL_DATA]]),
      names: { "1": "Made-up Ore" },
      setCharacters: (nextCharacters) => {
        characters.value = nextCharacters;
      },
      setInventory: (nextInventory) => {
        inventory.value = nextInventory;
      },
      setWallet: (nextWallet) => {
        wallet.value = nextWallet;
      },
      wallet,
    });
    events.emit("finishQuest", QUEST, PROGRESS, PROGRESS);
    expect(wallet.value[Currency.Mora]).toBe(EMPTY_WALLET[Currency.Mora] + 2);
    expect(inventory.value.items.map(({ definition, quantity }) => ({ id: definition.id, quantity }))).toStrictEqual([
      { id: ITEM_ID, quantity: 3 },
    ]);
    expect(gainAdventureExp).toHaveBeenCalledExactlyOnceWith(40);
    expect(characters.value.map(({ id, level }) => ({ id, level }))).toStrictEqual([
      { id: CHARACTER.id, level: CHARACTER.level + 1 },
      { id: BENCHED_CHARACTER.id, level: BENCHED_CHARACTER.level },
    ]);
  });
});
