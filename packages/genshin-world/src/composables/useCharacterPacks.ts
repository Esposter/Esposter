import type { CharacterPack } from "#src/models/character/CharacterPack";
import type { CharacterPackStore } from "#src/models/character/CharacterPackStore";
import type { StoredCharacterPack } from "#src/models/character/StoredCharacterPack";

import { useCharacterPackIds } from "#src/composables/useCharacterPackIds";
import { chooseCharacterPackReader } from "#src/services/character/chooseCharacterPackReader";
import { openCharacterPackStore } from "#src/services/character/openCharacterPackStore";
import { getResultAsync, noop } from "@esposter/shared";

// The characters' packs the world draws from: the ones the browser keeps, which a player loads and removes on the
// Character screen, ahead of the host's. A change to the kept packs that fails leaves them as they were, so a character
// Keeps whatever it was drawn with: a removal's failure is logged, and a keep's rejects for the loader to show
export const useCharacterPacks = ({
  characterPackBaseUrl,
  getActiveCharacterId,
}: {
  // Where the host serves the characters' packs, none in a production build
  characterPackBaseUrl?: string;
  // The character on the field, whose pack the world draws on the controller's body
  getActiveCharacterId: () => number;
}) => {
  const hostCharacterPackIds = useCharacterPackIds(characterPackBaseUrl);
  const characterPackStorePromise = openCharacterPackStore();
  const characterPackStore = shallowRef<CharacterPackStore>();
  const characterIdPackHashMap = shallowRef<ReadonlyMap<number, string>>(new Map());
  const setStoredCharacterPacks = (storedCharacterPacks: StoredCharacterPack[]) => {
    characterIdPackHashMap.value = new Map(
      storedCharacterPacks.map(({ characterId, packHash }) => [characterId, packHash]),
    );
  };
  const changeStoredCharacterPacks = async (change: (store: CharacterPackStore) => Promise<StoredCharacterPack[]>) => {
    setStoredCharacterPacks(await change(await characterPackStorePromise));
  };
  // The store is set before its index is read, so a read that fails still leaves the packs kept from here on drawn
  // oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
  getResultAsync(async () => {
    const store = await characterPackStorePromise;
    characterPackStore.value = store;
    setStoredCharacterPacks(await store.readIndex());
  }).match(noop, (error) => {
    console.error(error);
  });
  const getCharacterPackReader = (characterId: number) =>
    chooseCharacterPackReader(characterId, {
      characterIdPackHashMap: characterIdPackHashMap.value,
      characterPackBaseUrl,
      characterPackStore: characterPackStore.value,
      hostCharacterPackIds: hostCharacterPackIds.value,
    });
  // One reader for the character on the field, kept while its source stays, so the scene re-reads its model only as the
  // Character or its pack changes
  const activeCharacterPackReader = computed(() => getCharacterPackReader(getActiveCharacterId()));
  return {
    activeCharacterPackReader,
    characterIdPackHashMap,
    getCharacterPackReader,
    removeCharacterPack: (characterId: number) =>
      getResultAsync(() => changeStoredCharacterPacks((store) => store.remove(characterId))).match(noop, (error) => {
        console.error(error);
      }),
    storeCharacterPack: (characterPack: CharacterPack) =>
      changeStoredCharacterPacks((store) => store.put(characterPack)),
  };
};
