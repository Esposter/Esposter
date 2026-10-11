import { TALK_REVEAL_MS_PER_CHARACTER } from "#src/services/dialogue/constants";

// How much of a line is written out after its first milliseconds on screen, in characters: the game writes one more
// Character each TALK_REVEAL_MS_PER_CHARACTER, and a space or a line break takes no time of its own, showing with the
// Character before it, so the line is whole the moment its last character is written
export const getTalkRevealedLength = (line: string, elapsedMs: number): number => {
  const writtenCount = Math.floor(elapsedMs / TALK_REVEAL_MS_PER_CHARACTER);
  const characters = [...line];
  let visibleCount = 0;

  for (const [index, character] of characters.entries()) {
    if (/\s/u.test(character)) continue;
    if (visibleCount === writtenCount) return index;
    visibleCount++;
  }

  return characters.length;
};
