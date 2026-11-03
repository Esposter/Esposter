import type { Expedition } from "#src/models/expedition/Expedition";
import type { WorldExpeditionRosterOptions } from "#src/models/expedition/WorldExpeditionRosterOptions";

import { checkIsCharacterDown } from "#src/services/party/checkIsCharacterDown";
import { useWorldPartyStore } from "#src/store/party";
import { storeToRefs } from "pinia";
import { computed, shallowRef } from "vue";

// The expeditions out from the Adventurers' Guild, held for the session so a reload empties them, and the roster their
// Picker lists
export const useWorldExpeditionRoster = ({ characterTalentKits, getCharacterName }: WorldExpeditionRosterOptions) => {
  const worldPartyStore = useWorldPartyStore();
  const { characters } = storeToRefs(worldPartyStore);
  const { party } = worldPartyStore;
  const expeditions = shallowRef<Expedition[]>([]);
  // The roster the expedition picker lists in the game's order, each named by the game's text, and the characters down,
  // Whom no expedition is sent with
  const expeditionCharacters = computed(() => characters.value.map(({ id }) => ({ id, name: getCharacterName(id) })));
  // Each character's passives it has unlocked at its ascension, by their proud skill groups, which the expedition talents are
  // Read from. A character with no talent kit has none
  const characterPassiveGroupIdMap = computed(
    () =>
      new Map(
        characters.value.map(
          ({ ascension, id }) =>
            [
              id,
              new Set(
                (characterTalentKits.find((kit) => kit.characterId === id)?.passives ?? [])
                  .filter(({ phase }) => phase <= ascension)
                  .map(({ proudSkillGroupId }) => proudSkillGroupId),
              ),
            ] as const,
        ),
      ),
  );
  const downCharacterIds = computed(
    () => new Set(characters.value.filter(({ id }) => checkIsCharacterDown(party, id)).map(({ id }) => id)),
  );
  return { characterPassiveGroupIdMap, downCharacterIds, expeditionCharacters, expeditions };
};
