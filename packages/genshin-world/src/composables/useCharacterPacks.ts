import type { AccountCharacterPack } from "#src/models/character/AccountCharacterPack";
import type { CharacterPack } from "#src/models/character/CharacterPack";
import type { CharacterPackStore } from "#src/models/character/CharacterPackStore";
import type { StoredCharacterPack } from "#src/models/character/StoredCharacterPack";

import { useCharacterPackIds } from "#src/composables/useCharacterPackIds";
import { cacheAccountCharacterPack } from "#src/services/character/cacheAccountCharacterPack";
import { chooseCharacterPackReader } from "#src/services/character/chooseCharacterPackReader";
import { openCharacterPackStore } from "#src/services/character/openCharacterPackStore";
import { getResultAsync, getSynchronizedFunction, ID_SEPARATOR, noop } from "@esposter/shared";
import { watchImmediate } from "@vueuse/core";

// The characters' packs the world draws from: the ones the browser keeps, which a player loads and removes on the
// Character screen, then the player's account's, and the host's. A change to the kept packs that fails leaves them as
// They were, so a character keeps whatever it was drawn with: a removal's failure is logged, and a keep's rejects for the
// Loader to show
export const useCharacterPacks = ({
  accountFileBaseUrl,
  characterPackBaseUrl,
  getAccountCharacterPacks,
  getActiveCharacterId,
  keepAccountCharacterPack,
  removeAccountCharacterPack,
}: {
  // Where the player's account serves its files, given while the player is signed in
  accountFileBaseUrl?: string;
  // Where the host serves the characters' packs, none in a production build
  characterPackBaseUrl?: string;
  // The player's account's packs, empty while the player is signed out or the account's are still listing
  getAccountCharacterPacks: () => readonly AccountCharacterPack[];
  // The character on the field, whose pack the world draws on the controller's body
  getActiveCharacterId: () => number;
  // Keeps a pack for the player's account, given while the player is signed in, rejecting where it is not kept
  keepAccountCharacterPack?: (characterPack: CharacterPack) => Promise<void>;
  // Drops a character's pack from the player's account, given while the player is signed in
  removeAccountCharacterPack?: (characterId: number) => Promise<void>;
}) => {
  const hostCharacterPackIds = useCharacterPackIds(characterPackBaseUrl);
  const characterPackStorePromise = openCharacterPackStore();
  const characterPackStore = shallowRef<CharacterPackStore>();
  const characterIdPackHashMap = shallowRef<ReadonlyMap<number, string>>(new Map());
  const isStoredIndexRead = ref(false);
  const setStoredCharacterPacks = (storedCharacterPacks: StoredCharacterPack[]) => {
    characterIdPackHashMap.value = new Map(
      storedCharacterPacks.map(({ characterId, packHash }) => [characterId, packHash]),
    );
    isStoredIndexRead.value = true;
  };
  const changeStoredCharacterPacks = async (change: (store: CharacterPackStore) => Promise<StoredCharacterPack[]>) => {
    setStoredCharacterPacks(await change(await characterPackStorePromise));
  };
  // The store is set before its index is read, so a read that fails still leaves the packs kept from here on drawn
  getSynchronizedFunction(async () => {
    await getResultAsync(async () => {
      const store = await characterPackStorePromise;
      characterPackStore.value = store;
      setStoredCharacterPacks(await store.readIndex());
    }).match(noop, (error) => {
      console.error(error);
    });
  })();
  const getCharacterPackReader = (characterId: number) =>
    chooseCharacterPackReader(characterId, {
      accountCharacterPacks: getAccountCharacterPacks(),
      accountFileBaseUrl,
      characterIdPackHashMap: characterIdPackHashMap.value,
      characterPackBaseUrl,
      characterPackStore: characterPackStore.value,
      hostCharacterPackIds: hostCharacterPackIds.value,
    });
  // One reader for the character on the field, kept while its source stays, so the scene re-reads its model only as the
  // Character or its pack changes
  const activeCharacterPackReader = computed(() => getCharacterPackReader(getActiveCharacterId()));
  // The account's copy of the character on the field, when the browser keeps no copy of the same hash, is kept in the
  // Browser on its first read, once: the next load draws it from there. A copy that fails to keep is tried again when
  // The field's character next changes
  const cachedAccountCharacterPackKeys = new Set<string>();
  const uncachedActiveAccountCharacterPack = computed(() => {
    const characterId = getActiveCharacterId();
    return getAccountCharacterPacks().find(
      (accountCharacterPack) =>
        accountCharacterPack.characterId === characterId &&
        characterIdPackHashMap.value.get(characterId) !== accountCharacterPack.packHash,
    );
  });
  watchImmediate(
    [uncachedActiveAccountCharacterPack, isStoredIndexRead],
    async ([accountCharacterPack, isIndexRead]) => {
      if (!accountCharacterPack || !accountFileBaseUrl || !isIndexRead) return;
      const key = [accountCharacterPack.characterId, accountCharacterPack.packHash].join(ID_SEPARATOR);
      if (cachedAccountCharacterPackKeys.has(key)) return;
      cachedAccountCharacterPackKeys.add(key);
      await getResultAsync(async () => {
        const characterPack = await cacheAccountCharacterPack(accountFileBaseUrl, accountCharacterPack);
        return changeStoredCharacterPacks((store) => store.put(characterPack));
      }).match(noop, (error) => {
        cachedAccountCharacterPackKeys.delete(key);
        console.error(error);
      });
    },
  );
  return {
    activeCharacterPackReader,
    characterIdPackHashMap,
    getCharacterPackReader,
    isCharacterPackKept: (characterId: number) =>
      characterIdPackHashMap.value.has(characterId) ||
      getAccountCharacterPacks().some((accountCharacterPack) => accountCharacterPack.characterId === characterId),
    // Kept in the browser, then in the player's account, so a pack kept for the account draws on this browser too
    keepCharacterPack: async (characterPack: CharacterPack) => {
      await changeStoredCharacterPacks((store) => store.put(characterPack));
      await keepAccountCharacterPack?.(characterPack);
    },
    // Removed from the browser and from the account, a failure in either logged and the other still tried
    removeCharacterPack: async (characterId: number) => {
      await getResultAsync(() => changeStoredCharacterPacks((store) => store.remove(characterId))).match(
        noop,
        (error) => {
          console.error(error);
        },
      );
      await getResultAsync(() => Promise.resolve(removeAccountCharacterPack?.(characterId))).match(noop, (error) => {
        console.error(error);
      });
    },
  };
};
