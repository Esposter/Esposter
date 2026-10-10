import { readCharacterPackIds } from "#src/services/character/readCharacterPackIds";

// The characters the host holds a pack for, read once from its index, so a character with none is drawn as its capsule
// Without a request of its own. With no host, or an index that fails to load, which is logged, no character has one
export const useCharacterPackIds = (characterPackBaseUrl?: string) => {
  const characterPackIds = shallowRef<ReadonlySet<number>>(new Set());
  if (!characterPackBaseUrl) return characterPackIds;
  // oxlint-disable-next-line typescript/no-floating-promises -- match() handles both branches, so the promise it returns cannot reject and nothing waits on it
  readCharacterPackIds(characterPackBaseUrl).match(
    (ids) => {
      characterPackIds.value = new Set(ids);
    },
    (error) => {
      console.error(error);
    },
  );
  return characterPackIds;
};
