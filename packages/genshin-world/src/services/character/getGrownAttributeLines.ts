import type { AttributeLine } from "#src/models/character/AttributeLine";
import type { CharacterData } from "#src/models/character/CharacterData";

import { InvalidOperationError, Operation } from "@esposter/shared";

// What a character or a weapon has at a level and an ascension phase: each growing attribute's value at level 1 times
// Its curve's multiplier at the level, and every attribute the phase adds. A phase holds the levels from the one before
// Its cap to its own cap, the first from level 1, as the game ascends at a cap and levels on to the next
export const getGrownAttributeLines = (
  { ascensionPhases, growAttributes }: Pick<CharacterData, "ascensionPhases" | "growAttributes">,
  growCurveMap: ReadonlyMap<string, readonly number[]>,
  level: number,
  ascension: number,
): AttributeLine[] => {
  const ascensionPhase = ascensionPhases[ascension];
  const minimumLevel = ascensionPhases[ascension - 1]?.maxLevel ?? 1;
  if (!ascensionPhase || level < minimumLevel || level > ascensionPhase.maxLevel)
    throw new InvalidOperationError(
      Operation.Read,
      getGrownAttributeLines.name,
      `level ${level} is not in ascension phase ${ascension}`,
    );
  return [
    ...growAttributes.map(({ attribute, base, curve }) => {
      const multiplier = growCurveMap.get(curve)?.[level - 1];
      if (multiplier === undefined)
        throw new InvalidOperationError(Operation.Read, curve, `no multiplier at level ${level}`);
      return { attribute, value: base * multiplier };
    }),
    ...ascensionPhase.attributeLines,
  ];
};
