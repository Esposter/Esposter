import type { ImaginariumMember } from "#src/models/imaginarium/ImaginariumMember";

import { IMAGINARIUM_BATTLE_CHOICE_COUNT, IMAGINARIUM_BATTLE_FLOWERS } from "#src/services/imaginarium/constants";
import { drawRandomSubset } from "#src/services/imaginarium/drawRandomSubset";

// A won Battle Event: the Fantasia Flowers the run holds afterwards and the Alternate Cast members offered to join the
// Principal Cast, the lowest-keyed of the members' rolls taken, so each member is offered at most once
export const winImaginariumBattle = (
  flowers: number,
  alternateCast: ImaginariumMember[],
  random: () => number,
): { choices: ImaginariumMember[]; flowers: number } => ({
  choices: drawRandomSubset(alternateCast, IMAGINARIUM_BATTLE_CHOICE_COUNT, random),
  flowers: flowers + IMAGINARIUM_BATTLE_FLOWERS,
});
