import type { CharacterConstellationKit } from "#src/models/character/CharacterConstellationKit";

import { getCharacterIdConstellationsMap } from "#src/services/character/getCharacterIdConstellationsMap";
import { readConstellationTables } from "#src/services/character/readConstellationTables";
import { getResultAsync } from "@esposter/shared";
import { computed, shallowRef } from "vue";

// The constellation table, read as the world starts, and the constellations each character's one set holds, by its id. A
// Traveler's form has a set for each element, which a statue picks, so it has none here until one does
export const useWorldConstellations = (gameDataBaseUrl: string) => {
  const constellationKits = shallowRef<CharacterConstellationKit[]>([]);
  // oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
  getResultAsync(() => readConstellationTables(gameDataBaseUrl)).match(
    (kits) => {
      constellationKits.value = kits;
    },
    (error) => {
      console.error(error);
    },
  );
  const characterIdConstellationsMap = computed(() => getCharacterIdConstellationsMap(constellationKits.value));
  // The text id of each character's own Stella Fortuna's name, by the character's id, for a character with one set
  const stellaFortunaNameTextIdMap = computed(() => {
    const map = new Map<number, string>();
    for (const { characterId, depots } of constellationKits.value) {
      const [depot] = depots;
      if (depots.length === 1 && depot) map.set(characterId, depot.stellaFortuna.nameTextId);
    }
    return map;
  });
  return { characterIdConstellationsMap, stellaFortunaNameTextIdMap };
};
