import type { Character } from "#src/models/character/Character";
import type { CharacterData } from "#src/models/character/CharacterData";
import type { Constellation } from "#src/models/character/Constellation";
import type { Kit } from "#src/models/kit/Kit";
import type { Party } from "#src/models/party/Party";
import type { Ref } from "vue";

import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createCharacter } from "#src/services/character/createCharacter";
import { getPlayedTalentLevels } from "#src/services/character/getPlayedTalentLevels";
import { DATA_FETCH_RETRY_MS } from "#src/services/constants";
import { readCharacterKits } from "#src/services/kit/readCharacterKits";
import { createParty } from "#src/services/party/createParty";
import { createWorldParty, replaceWorldParty } from "#src/services/party/createWorldParty";
import { getActiveCharacterId } from "#src/services/party/getActiveCharacterId";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";
import { useWorldSessionStore } from "#src/store/session";
import { getResultAsync, getSynchronizedFunction } from "@esposter/shared";
import { useTimeoutFn } from "@vueuse/core";
import { defineStore } from "pinia";
import { computed, shallowRef, watch } from "vue";

// The roster the player fields: the characters they hold, the party those characters make up and the kits the deployed
// Team plays with. The kits are built at the world's gate for the starting team and read once for each character the team
// Takes in after, a failed read read again a wait later. The party is one reactive object the session starts with the
// Save's and changes where it stands, so everything that was handed it keeps the same one. The session starts it before
// The combat and every feature that reads the team, and stops it as it unmounts
export const useWorldPartyStore = defineStore("world/party", () => {
  const worldSessionStore = useWorldSessionStore();
  const characters = shallowRef<Character[]>([]);
  const party = createWorldParty(createParty([TRAVELER_CHARACTER_ID]));
  // The deployed team's kits, each character's built once as the team takes it in, its module and multipliers read on
  // Demand, playing each talent at the level it holds with what its constellations add
  const characterIdKitMap = shallowRef<ReadonlyMap<number, Kit>>(new Map());
  let characterIdConstellationsMap: Readonly<Ref<ReadonlyMap<number, Constellation[]>>> = shallowRef(new Map());
  const deployedCharacterIds = computed(() => getDeployedCharacterIds(party));
  // The character on the field, which the screens and the HUD name the active member by
  const activeCharacterId = computed(() => getActiveCharacterId(party));
  // The deployed team's skill and burst icons the HUD's buttons carry, by character id, each carried by its kit
  const characterIdSkillGlyphsMap = computed(
    () =>
      new Map(
        [...characterIdKitMap.value].flatMap(([characterId, { skillGlyphs }]) =>
          skillGlyphs ? [[characterId, skillGlyphs] as const] : [],
        ),
      ),
  );
  // A failed read is read again a wait later, as a team that does not change starts no other
  const { start: retryCharacterKits, stop: stopRetry } = useTimeoutFn(
    () => {
      readUnloadedCharacterKits();
    },
    DATA_FETCH_RETRY_MS,
    { immediate: false },
  );
  const readUnloadedCharacterKits = () => {
    const unloadedCharacters = characters.value.filter(
      ({ id }) => deployedCharacterIds.value.includes(id) && !characterIdKitMap.value.has(id),
    );
    if (unloadedCharacters.length === 0) return;
    const characterTalentLevelMap = new Map(
      unloadedCharacters.map(
        (character) =>
          [
            character.id,
            getPlayedTalentLevels(character, characterIdConstellationsMap.value.get(character.id) ?? []),
          ] as const,
      ),
    );
    getSynchronizedFunction(() =>
      getResultAsync(() => readCharacterKits(worldSessionStore.gameDataBaseUrl, characterTalentLevelMap)).match(
        (newCharacterIdKitMap) => {
          // A kit already built is kept over one a read overlapping it built again, since a kit in play holds its state
          characterIdKitMap.value = new Map([...newCharacterIdKitMap, ...characterIdKitMap.value]);
        },
        (error) => {
          console.error(error);
          retryCharacterKits();
        },
      ),
    )();
  };
  watch(deployedCharacterIds, readUnloadedCharacterKits);
  const start = (starting: {
    characterDataMap: ReadonlyMap<number, CharacterData>;
    characterIdConstellationsMap: Readonly<Ref<ReadonlyMap<number, Constellation[]>>>;
    savedCharacters: Character[];
    savedParty: Party;
    startingCharacterIdKitMap: ReadonlyMap<number, Kit>;
  }) => {
    characterIdConstellationsMap = starting.characterIdConstellationsMap;
    characterIdKitMap.value = starting.startingCharacterIdKitMap;
    // A new player starts with the Traveler alone
    characters.value =
      starting.savedCharacters.length > 0
        ? starting.savedCharacters
        : [createCharacter(TRAVELER_CHARACTER_ID, starting.characterDataMap)];
    replaceWorldParty(party, starting.savedParty);
  };
  const stop = () => {
    stopRetry();
    characterIdConstellationsMap = shallowRef(new Map());
    characterIdKitMap.value = new Map();
    characters.value = [];
    replaceWorldParty(party, createParty([TRAVELER_CHARACTER_ID]));
  };

  return {
    activeCharacterId,
    characterIdKitMap,
    characterIdSkillGlyphsMap,
    characters,
    deployedCharacterIds,
    party,
    start,
    stop,
  };
});
