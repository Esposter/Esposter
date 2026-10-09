import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { takeOne } from "@esposter/shared";

// A talent card a character equips while she is the active character, and whose skill is used once at once: the skill of
// The game's id, which the character holds
export const createGcgTalentCard = (
  characterId: number,
  skillId: number,
): Pick<GcgCardModule, "canPlay" | "skillOnPlay"> => ({
  canPlay: ({ duel, sideIndex }, targetIndex) => {
    const side = takeOne(duel.sides, sideIndex);
    return (
      targetIndex !== undefined &&
      targetIndex === side.activeIndex &&
      side.characters.at(targetIndex)?.character.id === characterId
    );
  },
  skillOnPlay: ({ duel, sideIndex }, targetIndex) =>
    targetIndex === undefined
      ? undefined
      : takeOne(duel.sides, sideIndex)
          .characters.at(targetIndex)
          ?.character.skills.find(({ id }) => id === skillId),
});
