import type { ArtifactRarityData } from "#src/models/artifact/ArtifactRarityData";
import type { CharacterData } from "#src/models/character/CharacterData";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { Trial } from "#src/models/trial/Trial";
import type { TrialArena } from "#src/models/trial/TrialArena";
import type { WeaponData } from "#src/models/weapon/WeaponData";
import type { CharacterTrialTables } from "#src/services/trial/readCharacterTrials";
import type { Ref } from "vue";

import { DomainChallengeOutcome } from "#src/models/domains/DomainChallengeOutcome";
import { computeDomainChallengeElapsed } from "#src/services/domains/computeDomainChallengeElapsed";
import { resolveDomainChallenge } from "#src/services/domains/resolveDomainChallenge";
import { TRIAL_PROVISIONAL_TIME_LIMIT_MILLISECONDS } from "#src/services/trial/constants";
import { claimTrialStageReward } from "#src/services/trial/claimTrialStageReward";
import { createTrialCharacter } from "#src/services/trial/createTrialCharacter";
import { readCharacterTrials } from "#src/services/trial/readCharacterTrials";
import { getResultAsync } from "@esposter/shared";
import { computed, shallowRef } from "vue";

// The character trials on the world: their tables read once, a trial entered with its party member and no enemies, and its
// Clock stepped each frame. The arena's clock is the only clear there is, so its end pays the stage's first-clear reward once
// (PROVISIONAL, until the design names the rule). A party down ends the arena with no reward
export const useWorldTrials = ({
  artifactRarityDataMap,
  characterDataMap,
  gameDataBaseUrl,
  inventory,
  materialDataMap,
  nameText,
  setInventory,
  setWallet,
  wallet,
  weaponDataMap,
}: {
  artifactRarityDataMap: ReadonlyMap<number, ArtifactRarityData>;
  characterDataMap: ReadonlyMap<number, Pick<CharacterData, "ascensionPhases">>;
  gameDataBaseUrl: string;
  inventory: Ref<Inventory>;
  materialDataMap: ReadonlyMap<number, MaterialData>;
  nameText: Readonly<Record<string, string>>;
  setInventory: (inventory: Inventory) => void;
  setWallet: (wallet: Wallet) => void;
  wallet: Ref<Wallet>;
  weaponDataMap: ReadonlyMap<number, Pick<WeaponData, "ascensionPhases">>;
}) => {
  const trialTables = shallowRef<CharacterTrialTables>();
  // The stages whose first clear has paid, which the save will keep once it carries them
  const trialClaimedStageIds = shallowRef<ReadonlySet<number>>(new Set());
  const trialArena = shallowRef<TrialArena>();
  // oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
  getResultAsync(() => readCharacterTrials(gameDataBaseUrl)).match(
    (tables) => {
      trialTables.value = tables;
    },
    (error) => {
      console.error(error);
    },
  );

  // The trials the banners can offer, each as the character it tries, the level it fights at and its trial id
  const trials = computed<Trial[]>(() =>
    Object.values(trialTables.value?.avatars ?? {}).map(({ characterId, level, trialAvatarId }) => ({
      characterId,
      level,
      trialId: trialAvatarId,
    })),
  );

  // A trial entered with its party member, on the first stage its trial id names. A trial whose tables are not read, whose
  // Stage is not named or whose character has no build does not enter, and an arena already entered is not entered again
  const enterTrial = (trial: Trial) => {
    const tables = trialTables.value;
    if (!tables || trialArena.value) return;
    const stage = Object.values(tables.stages).find(({ trialAvatarId }) => trialAvatarId === trial.trialId);
    const character = createTrialCharacter(trial, tables, { artifactRarityDataMap, characterDataMap, weaponDataMap });
    if (!stage || !character) return;
    trialArena.value = { character, elapsedMilliseconds: 0, stageId: stage.id };
  };

  // A trial's first clear pays its stage's reward into the bag and the wallet and records the claim. A later clear pays nothing,
  // And a bag with no room for the reward records nothing, and the console names it
  const clearTrial = (stageId: number) => {
    const tables = trialTables.value;
    if (!tables || trialClaimedStageIds.value.has(stageId)) return;
    const claim = claimTrialStageReward(
      stageId,
      tables,
      trialClaimedStageIds.value,
      inventory.value,
      wallet.value,
      nameText,
      materialDataMap,
    );
    if (!claim) {
      console.error(`the bag has no room for trial stage ${stageId}'s reward, so its clear is not recorded`);
      return;
    }
    setInventory(claim.inventory);
    setWallet(claim.wallet);
    trialClaimedStageIds.value = claim.claimedStageIds;
  };

  // The arena's clock, stepped each frame and when the party falls. The clock counts only while the world is open. When it runs
  // Out the trial is cleared, and its first clear pays once (PROVISIONAL)
  const stepTrial = ({
    deltaMilliseconds,
    isPlaying,
    partyDown,
  }: {
    deltaMilliseconds: number;
    isPlaying: boolean;
    partyDown: boolean;
  }) => {
    const arena = trialArena.value;
    if (!arena) return;
    const elapsedMilliseconds = computeDomainChallengeElapsed(arena.elapsedMilliseconds, deltaMilliseconds, isPlaying);
    const outcome = resolveDomainChallenge(
      {
        defeatTarget: Number.POSITIVE_INFINITY,
        defeats: 0,
        elapsedMilliseconds,
        timeLimitMilliseconds: TRIAL_PROVISIONAL_TIME_LIMIT_MILLISECONDS,
      },
      { partyDown },
    );
    if (outcome === DomainChallengeOutcome.Running) {
      trialArena.value = { ...arena, elapsedMilliseconds };
      return;
    }
    trialArena.value = undefined;
    if (outcome === DomainChallengeOutcome.TimedOut) clearTrial(arena.stageId);
  };

  return { enterTrial, stepTrial, trialArena, trialClaimedStageIds, trials };
};
