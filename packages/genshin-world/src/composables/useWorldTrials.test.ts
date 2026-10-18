import type { ArtifactRarityData } from "#src/models/artifact/ArtifactRarityData";
import type { Character } from "#src/models/character/Character";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { Kit } from "#src/models/kit/Kit";
import type { WorldJumpPose } from "#src/models/world/WorldJumpPose";
import type { Trial } from "#src/models/trial/Trial";
import type { CharacterTrialTables } from "#src/services/trial/readCharacterTrials";

import { useWorldTrials } from "#src/composables/useWorldTrials";
import { CombatTalent } from "#src/models/character/CombatTalent";
import { Currency } from "#src/models/inventory/Currency";
import { readCharacterKits } from "#src/services/kit/readCharacterKits";
import { createParty } from "#src/services/party/createParty";
import { createWorldParty } from "#src/services/party/createWorldParty";
import { CurrencyItemIdMap, EMPTY_INVENTORY, EMPTY_WALLET } from "#src/services/inventory/constants";
import { toCharacterTrialSave } from "#src/services/save/toCharacterTrialSave";
import { TRIAL_PROVISIONAL_TIME_LIMIT_MILLISECONDS } from "#src/services/trial/constants";
import { takeOne } from "@esposter/shared";
import { beforeEach, describe, expect, test, vi } from "vitest";
import { shallowRef } from "vue";

const CHARACTER_ID = 1001;
const OWNED_CHARACTER_ID = 1002;
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
const OWNED_KIT = {} as Kit;
const TRIAL_KIT = {} as Kit;
const RETURN_POSE: WorldJumpPose = { heightOffset: 0, point: { x: 12, z: -3 }, yaw: 1 };
const TIMED_OUT_STEP = {
  deltaMilliseconds: TRIAL_PROVISIONAL_TIME_LIMIT_MILLISECONDS,
  isPlaying: true,
  partyDown: false,
};

vi.mock(import("#src/services/trial/readCharacterTrials"), () => ({
  readCharacterTrials: () => Promise.resolve(TABLES),
}));
vi.mock(import("#src/services/kit/readCharacterKits"), () => ({
  readCharacterKits: vi.fn<() => Promise<Map<number, Kit>>>(),
}));

const flushReads = () =>
  new Promise((resolve) => {
    setTimeout(resolve, 0);
  });

// The world's inputs the trials read and write, each a fresh one a test can keep a hold of
const createDependencies = () => ({
  artifactRarityDataMap: new Map<number, ArtifactRarityData>(),
  characterDataMap: new Map([[CHARACTER_ID, { ascensionPhases: [{ attributeLines: [], maxLevel: 90 }] }]]),
  characterIdKitMap: shallowRef<ReadonlyMap<number, Kit>>(new Map([[OWNED_CHARACTER_ID, OWNED_KIT]])),
  characters: shallowRef<Character[]>([]),
  claimedStageIds: new Set<number>(),
  gameDataBaseUrl: "https://example.test/game-data/",
  inventory: shallowRef(EMPTY_INVENTORY),
  materialDataMap: new Map(),
  nameText: {},
  party: createWorldParty(createParty([OWNED_CHARACTER_ID])),
  setInventory: vi.fn<(inventory: Inventory) => void>(),
  setWallet: vi.fn<(wallet: Wallet) => void>(),
  wallet: shallowRef(EMPTY_WALLET),
  weaponDataMap: new Map([
    [
      2001,
      { ascensionPhases: [{ attributeLines: [], coinCost: 0, costItems: [], maxLevel: 90, requiredPlayerLevel: 0 }] },
    ],
  ]),
});

const setUpTrials = (overrides: Partial<ReturnType<typeof createDependencies>> = {}) =>
  useWorldTrials({ ...createDependencies(), ...overrides });

describe(useWorldTrials, () => {
  beforeEach(() => {
    vi.mocked(readCharacterKits).mockResolvedValue(new Map([[CHARACTER_ID, TRIAL_KIT]]));
  });

  test("a trial's timer runs out and its first clear pays the reward once", async () => {
    expect.hasAssertions();
    const setWallet = vi.fn<(wallet: Wallet) => void>();
    const { enterTrial, stepTrial, trialArena, trialClaimedStageIds, trials } = setUpTrials({ setWallet });
    await flushReads();
    expect(trials.value).toHaveLength(1);
    const trial: Trial = takeOne(trials.value);

    await expect(enterTrial(trial, RETURN_POSE)).resolves.toBe(true);
    expect(trialArena.value?.character.talentLevels[CombatTalent.NormalAttack]).toBe(1);
    stepTrial(TIMED_OUT_STEP);
    expect(trialArena.value).toBeUndefined();
    expect(trialClaimedStageIds.value).toStrictEqual(new Set([STAGE_ID]));
    expect(setWallet).toHaveBeenCalledTimes(1);
    expect(setWallet).toHaveBeenCalledWith({ ...EMPTY_WALLET, [Currency.Primogem]: PRIMOGEM_COUNT });

    await enterTrial(trial, RETURN_POSE);
    stepTrial(TIMED_OUT_STEP);
    expect(setWallet).toHaveBeenCalledTimes(1);
  });

  test("a trial takes the player's roster for its fight, and the roster is given back when it ends", async () => {
    expect.hasAssertions();
    const characters = shallowRef<Character[]>([]);
    const ownedCharacters = characters.value;
    const ownedKitMap: ReadonlyMap<number, Kit> = new Map([[OWNED_CHARACTER_ID, OWNED_KIT]]);
    const characterIdKitMap = shallowRef<ReadonlyMap<number, Kit>>(ownedKitMap);
    const party = createWorldParty(createParty([OWNED_CHARACTER_ID]));
    const { enterTrial, stepTrial, trials } = setUpTrials({ characterIdKitMap, characters, party });
    await flushReads();

    await enterTrial(takeOne(trials.value), RETURN_POSE);
    expect(characters.value).toHaveLength(1);
    expect(takeOne(characters.value).id).toBe(CHARACTER_ID);
    expect(characterIdKitMap.value).toStrictEqual(new Map([[CHARACTER_ID, TRIAL_KIT]]));
    expect([...party.characterIdMemberMap.keys()]).toStrictEqual([CHARACTER_ID]);

    stepTrial(TIMED_OUT_STEP);
    expect(characters.value).toBe(ownedCharacters);
    expect(characterIdKitMap.value).toBe(ownedKitMap);
    expect([...party.characterIdMemberMap.keys()]).toStrictEqual([OWNED_CHARACTER_ID]);
  });

  test("a party down ends a trial with no reward and gives the player's roster back", async () => {
    expect.hasAssertions();
    const setWallet = vi.fn<(wallet: Wallet) => void>();
    const characters = shallowRef<Character[]>([]);
    const ownedCharacters = characters.value;
    const { enterTrial, stepTrial, trialArena, trialClaimedStageIds, trials } = setUpTrials({ characters, setWallet });
    await flushReads();

    await enterTrial(takeOne(trials.value), RETURN_POSE);
    stepTrial({ deltaMilliseconds: 0, isPlaying: false, partyDown: true });
    expect(trialArena.value).toBeUndefined();
    expect(characters.value).toBe(ownedCharacters);
    expect(trialClaimedStageIds.value.size).toBe(0);
    expect(setWallet).not.toHaveBeenCalled();
  });

  test("a claim saved and loaded again keeps its stage's reward unpaid", async () => {
    expect.hasAssertions();
    const first = setUpTrials();
    await flushReads();
    const trial: Trial = takeOne(first.trials.value);
    await first.enterTrial(trial, RETURN_POSE);
    first.stepTrial(TIMED_OUT_STEP);
    const save = toCharacterTrialSave(first.trialClaimedStageIds.value);
    expect(save).toStrictEqual({ claimedStageIds: [STAGE_ID] });

    // A reload starts the world with the save's claims, so the stage's clear pays nothing the second time
    const setWallet = vi.fn<(wallet: Wallet) => void>();
    const second = setUpTrials({ claimedStageIds: new Set(save.claimedStageIds), setWallet });
    await flushReads();
    await second.enterTrial(trial, RETURN_POSE);
    second.stepTrial(TIMED_OUT_STEP);
    expect(second.trialClaimedStageIds.value).toStrictEqual(new Set([STAGE_ID]));
    expect(setWallet).not.toHaveBeenCalled();
  });

  test("a trial's end returns the player to the pose it was entered from", async () => {
    expect.hasAssertions();
    const { enterTrial, stepTrial, trials } = setUpTrials();
    await flushReads();
    await enterTrial(takeOne(trials.value), RETURN_POSE);

    expect(stepTrial({ deltaMilliseconds: 1, isPlaying: true, partyDown: false })).toBeUndefined();
    expect(stepTrial(TIMED_OUT_STEP)).toStrictEqual(RETURN_POSE);
  });

  test("a party down returns the player to the pose it was entered from too", async () => {
    expect.hasAssertions();
    const { enterTrial, stepTrial, trials } = setUpTrials();
    await flushReads();
    await enterTrial(takeOne(trials.value), RETURN_POSE);

    expect(stepTrial({ deltaMilliseconds: 0, isPlaying: false, partyDown: true })).toStrictEqual(RETURN_POSE);
  });

  test("a trial's countdown reads the seconds its clock has left", async () => {
    expect.hasAssertions();
    const { enterTrial, stepTrial, trialSecondsRemaining, trials } = setUpTrials();
    await flushReads();
    await enterTrial(takeOne(trials.value), RETURN_POSE);
    expect(trialSecondsRemaining.value).toBe(300);

    stepTrial({ deltaMilliseconds: 1500, isPlaying: true, partyDown: false });
    expect(trialSecondsRemaining.value).toBe(299);
    stepTrial(TIMED_OUT_STEP);
    expect(trialSecondsRemaining.value).toBeUndefined();
  });
});
