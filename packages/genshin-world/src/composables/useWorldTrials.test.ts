import type { CharacterTrialTables } from "#src/services/trial/readCharacterTrials";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { Trial } from "#src/models/trial/Trial";

import { useWorldTrials } from "#src/composables/useWorldTrials";
import { Currency } from "#src/models/inventory/Currency";
import { CombatTalent } from "#src/models/character/CombatTalent";
import { CurrencyItemIdMap, EMPTY_INVENTORY, EMPTY_WALLET } from "#src/services/inventory/constants";
import { TRIAL_PROVISIONAL_TIME_LIMIT_MILLISECONDS } from "#src/services/trial/constants";
import { describe, expect, test, vi } from "vitest";
import { shallowRef } from "vue";

const CHARACTER_ID = 1001;
const TRIAL_AVATAR_ID = 1022;
const STAGE_ID = 51_001;
const REWARD_ID = 480_001;
const PRIMOGEM_COUNT = 20;
const PRIMOGEM_ITEM_ID = CurrencyItemIdMap[Currency.Primogem];
const TABLES: CharacterTrialTables = {
  avatars: { [TRIAL_AVATAR_ID]: { characterId: CHARACTER_ID, level: 85, trialAvatarId: TRIAL_AVATAR_ID } },
  builds: { [CHARACTER_ID]: { characterId: CHARACTER_ID, constellation: 0, refinement: 1, weaponId: 2001 } },
  reliquaries: {},
  rewards: { [REWARD_ID]: [{ count: PRIMOGEM_COUNT, itemId: PRIMOGEM_ITEM_ID }] },
  stages: {
    [STAGE_ID]: {
      dungeonId: 6131,
      id: STAGE_ID,
      rewardId: REWARD_ID,
      trialAvatarId: TRIAL_AVATAR_ID,
      trialAvatarIndexId: 1,
    },
  },
  templates: [{ level: 1, reliquaryIds: [], talentLevel: 1 }],
};

vi.mock(import("#src/services/trial/readCharacterTrials"), () => ({
  readCharacterTrials: () => Promise.resolve(TABLES),
}));

const flushReads = () =>
  new Promise((resolve) => {
    setTimeout(resolve, 0);
  });

describe(useWorldTrials, () => {
  test("a trial's timer runs out and its first clear pays the reward once", async () => {
    expect.hasAssertions();
    const setInventory = vi.fn<(inventory: Inventory) => void>();
    const setWallet = vi.fn<(wallet: Wallet) => void>();
    const { enterTrial, stepTrial, trialArena, trialClaimedStageIds, trials } = useWorldTrials({
      artifactRarityDataMap: new Map(),
      characterDataMap: new Map([[CHARACTER_ID, { ascensionPhases: [{ attributeLines: [], maxLevel: 90 }] }]]),
      gameDataBaseUrl: "https://example.test/game-data/",
      inventory: shallowRef(EMPTY_INVENTORY),
      materialDataMap: new Map(),
      nameText: {},
      setInventory,
      setWallet,
      wallet: shallowRef(EMPTY_WALLET),
      weaponDataMap: new Map([[2001, { ascensionPhases: [{ attributeLines: [], maxLevel: 90 }] }]]),
    });
    await flushReads();
    expect(trials.value).toHaveLength(1);
    const trial: Trial = trials.value[0];
    const step = { deltaMilliseconds: TRIAL_PROVISIONAL_TIME_LIMIT_MILLISECONDS, isPlaying: true, partyDown: false };

    enterTrial(trial);
    expect(trialArena.value?.character.talentLevels[CombatTalent.NormalAttack]).toBe(1);
    stepTrial(step);
    expect(trialArena.value).toBeUndefined();
    expect(trialClaimedStageIds.value).toStrictEqual(new Set([STAGE_ID]));
    expect(setWallet).toHaveBeenCalledTimes(1);
    expect(setWallet).toHaveBeenCalledWith({ ...EMPTY_WALLET, [Currency.Primogem]: PRIMOGEM_COUNT });

    enterTrial(trial);
    stepTrial(step);
    expect(setWallet).toHaveBeenCalledTimes(1);
  });
});
