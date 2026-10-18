// The characters that are Hexerei, as gcsim v2.47.2 flags them by default in each character's own package: Razor, Fischl,
// Mona, Sucrose, Durin, Varka, Prune and Nicole. The dump tags no character as Hexerei and the wiki's list could not be
// Fetched, so this set is provisional until either one is read
// https://github.com/genshinsim/gcsim/tree/v2.47.2/internal/characters
const HEXEREI_CHARACTER_IDS = new Set<number>([
  10_000_020, 10_000_031, 10_000_041, 10_000_043, 10_000_123, 10_000_128, 10_000_131, 10_000_132,
]);

// The number of the given team's members that are Hexerei characters, counted by their ids alone
export const countKitHexereiMembers = (characterIds: Iterable<number>): number => {
  let count = 0;
  for (const characterId of characterIds) if (HEXEREI_CHARACTER_IDS.has(characterId)) count++;
  return count;
};
