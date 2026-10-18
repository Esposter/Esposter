// The characters that are Hexerei, as the wiki's Hexerei Characters category lists them: Albedo, Durin, Fischl, Klee, Lohen,
// Mona, Nicole, Prune, Razor, Sucrose, Varka and Venti, read from genshin-impact.fandom.com on 2026-10-19
// The dump tags none of them, so the wiki is the citation for the set
// https://genshin-impact.fandom.com/wiki/Category:Hexerei_Characters
const HEXEREI_CHARACTER_IDS = new Set<number>([
  10_000_020, 10_000_022, 10_000_029, 10_000_031, 10_000_038, 10_000_041, 10_000_043, 10_000_123, 10_000_128,
  10_000_129, 10_000_131, 10_000_132,
]);

// The number of the given team's members that are Hexerei characters, counted by their ids alone
export const countKitHexereiMembers = (characterIds: Iterable<number>): number => {
  let count = 0;
  for (const characterId of characterIds) if (HEXEREI_CHARACTER_IDS.has(characterId)) count++;
  return count;
};

// Whether a character is Hexerei, as the set above flags it
export const checkIsKitHexerei = (characterId: number): boolean => HEXEREI_CHARACTER_IDS.has(characterId);
