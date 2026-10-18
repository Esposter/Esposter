import type { ArtifactRarityData } from "#src/models/artifact/ArtifactRarityData";
import type { Character } from "#src/models/character/Character";
import type { CharacterData } from "#src/models/character/CharacterData";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { MaterialData } from "#src/models/inventory/MaterialData";
import type { Wallet } from "#src/models/inventory/Wallet";
import type { Kit } from "#src/models/kit/Kit";
import type { Party } from "#src/models/party/Party";
import type { Trial } from "#src/models/trial/Trial";
import type { TrialArena } from "#src/models/trial/TrialArena";
import type { TrialRoster } from "#src/models/trial/TrialRoster";
import type { WeaponData } from "#src/models/weapon/WeaponData";
import type { CharacterTrialTables } from "#src/services/trial/readCharacterTrials";
import type { Ref } from "vue";

import { DomainChallengeOutcome } from "#src/models/domains/DomainChallengeOutcome";
import { getPlayedTalentLevels } from "#src/services/character/getPlayedTalentLevels";
import { computeDomainChallengeElapsed } from "#src/services/domains/computeDomainChallengeElapsed";
import { resolveDomainChallenge } from "#src/services/domains/resolveDomainChallenge";
import { readCharacterKits } from "#src/services/kit/readCharacterKits";
import { createParty } from "#src/services/party/createParty";
import { createWorldParty } from "#src/services/party/createWorldParty";
import { TRIAL_PROVISIONAL_TIME_LIMIT_MILLISECONDS } from "#src/services/trial/constants";
import { claimTrialStageReward } from "#src/services/trial/claimTrialStageReward";
import { createTrialCharacter } from "#src/services/trial/createTrialCharacter";
import { readCharacterTrials } from "#src/services/trial/readCharacterTrials";
import { getResultAsync } from "@esposter/shared";
import { computed, shallowRef } from "vue";

// The character trials on the world: their tables read once, a trial entered in place of the player's roster with its party
// Member alone and no enemies, and its clock stepped each frame. The arena's clock is the only clear there is, so its end pays
// The stage's first-clear reward once (PROVISIONAL, until the design names the rule). A party down ends the arena with no
// Reward, and either end gives the player's roster back as it was
export const useWorldTrials = ({
  artifactRarityDataMap,
  characterDataMap,
  characterIdKitMap,
  characters,
  claimedStageIds,
  gameDataBaseUrl,
  inventory,
  materialDataMap,
  nameText,
  party,
  setInventory,
  setWallet,
  wallet,
  weaponDataMap,
}: {
  artifactRarityDataMap: ReadonlyMap<number, ArtifactRarityData>;
  characterDataMap: ReadonlyMap<number, Pick<CharacterData, "ascensionPhases">>;
  characterIdKitMap: Ref<ReadonlyMap<number, Kit>>;
  characters: Ref<Character[]>;
  claimedStageIds: ReadonlySet<number>;
  gameDataBaseUrl: string;
  inventory: Ref<Inventory>;
  materialDataMap: ReadonlyMap<number, MaterialData>;
  nameText: Readonly<Record<string, string>>;
  party: Party;
  setInventory: (inventory: Inventory) => void;
  setWallet: (wallet: Wallet) => void;
  wallet: Ref<Wallet>;
  weaponDataMap: ReadonlyMap<number, Pick<WeaponData, "ascensionPhases">>;
}) => {
  const trialTables = shallowRef<CharacterTrialTables>();
  // The stages whose first clear has paid, which the save keeps: the ones the save held when the world loaded, and each first
  // Clear since
  const trialClaimedStageIds = shallowRef<ReadonlySet<number>>(claimedStageIds);
  const trialArena = shallowRef<TrialArena>();
  // The player's roster while a trial holds its place, which the save keeps in the trial's stead and the trial's end restores
  const playerRoster = shallowRef<TrialRoster>();
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

  // A trial entered in place of the player's roster, on the first stage its trial id names. Its party member's kit is read at
  // The talents it plays with no constellations, since a trial's build has none, and the kit replaces the player's kits for the
  // Fight. A trial whose tables are not read, whose stage is not named, whose character has no build or whose kit is not read
  // Does not enter, and an arena already entered is not entered again. Resolves whether the trial entered
  const enterTrial = async (trial: Trial): Promise<boolean> => {
    const tables = trialTables.value;
    if (!tables || trialArena.value) return false;
    const stage = Object.values(tables.stages).find(({ trialAvatarId }) => trialAvatarId === trial.trialId);
    const character = createTrialCharacter(trial, tables, { artifactRarityDataMap, characterDataMap, weaponDataMap });
    if (!stage || !character) return false;
    const kits = await getResultAsync(() =>
      readCharacterKits(gameDataBaseUrl, new Map([[character.id, getPlayedTalentLevels(character, [])]])),
    ).match(
      (newCharacterIdKitMap) => newCharacterIdKitMap,
      (error) => {
        console.error(error);
        return undefined;
      },
    );
    // A trial entered while its kit was read is not entered again, so the roster is held once
    if (!kits || trialArena.value) return false;
    playerRoster.value = {
      characterIdKitMap: characterIdKitMap.value,
      characters: characters.value,
      party: { ...party },
    };
    characters.value = [character];
    Object.assign(party, createWorldParty(createParty([character.id])));
    characterIdKitMap.value = kits;
    trialArena.value = { character, elapsedMilliseconds: 0, stageId: stage.id };
    return true;
  };

  // The player's roster held for the trial is given back in place, so the party the world holds is the one it held before
  const restorePlayerRoster = () => {
    const roster = playerRoster.value;
    if (!roster) return;
    characters.value = roster.characters;
    Object.assign(party, roster.party);
    characterIdKitMap.value = roster.characterIdKitMap;
    playerRoster.value = undefined;
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
  // Out the trial is cleared, and its first clear pays once (PROVISIONAL). Either end gives the player's roster back
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
    restorePlayerRoster();
    if (outcome === DomainChallengeOutcome.TimedOut) clearTrial(arena.stageId);
  };

  return { enterTrial, playerRoster, stepTrial, trialArena, trialClaimedStageIds, trials };
};
