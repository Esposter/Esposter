import type { ImaginariumMember } from "#src/models/imaginarium/ImaginariumMember";

import { IMAGINARIUM_BATTLE_CHOICE_COUNT, IMAGINARIUM_BATTLE_FLOWERS } from "#src/services/imaginarium/constants";

// A won Battle Event: the Fantasia Flowers the run holds afterwards and the Alternate Cast members offered to join the
// Principal Cast, the lowest-keyed of the members' rolls taken, so each member is offered at most once
export const winImaginariumBattle = (
  flowers: number,
  alternateCast: ImaginariumMember[],
  random: () => number,
): { choices: ImaginariumMember[]; flowers: number } => ({
  choices: alternateCast
    .map((member) => ({ key: random(), member }))
    .toSorted((firstEntry, secondEntry) => firstEntry.key - secondEntry.key)
    .slice(0, IMAGINARIUM_BATTLE_CHOICE_COUNT)
    .map(({ member }) => member),
  flowers: flowers + IMAGINARIUM_BATTLE_FLOWERS,
});
