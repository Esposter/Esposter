import type { CardedCharacter } from "#src/models/CardedCharacter";
import type { GenshinContext } from "#src/models/GenshinContext";

import { getRosterLine } from "#src/services/cli/getRosterLine";
import { readCardedRoster } from "#src/services/readCardedRoster";

// An authoring queue prints the characters that meet it newest first, so a patch's arrivals are at the top
export const printQueue = async (
  { roster }: GenshinContext,
  checkIsQueued: (cardedCharacter: CardedCharacter) => boolean,
): Promise<void> => {
  const cardedRoster = await readCardedRoster(roster);
  for (const { character } of cardedRoster
    .filter((cardedCharacter) => checkIsQueued(cardedCharacter))
    .toSorted(
      ({ character: a }, { character: b }) =>
        b.version.localeCompare(a.version, undefined, { numeric: true }) || a.name.localeCompare(b.name),
    ))
    console.log(getRosterLine(character));
};
