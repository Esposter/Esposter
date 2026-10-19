import type { ArtifactMinorAffixGroup } from "#src/models/artifact/ArtifactMinorAffixGroup";
import type { Attribute } from "#src/models/character/Attribute";
import type { AttributeLine } from "#src/models/character/AttributeLine";

import { ArtifactMinorAffixWeightMap, MAX_MINOR_AFFIX_COUNT } from "#src/services/artifact/constants";
import { drawWeightedValue } from "#src/services/shared/drawWeightedValue";
import { InvalidOperationError, Operation, takeRandom } from "@esposter/shared";

// The minor affixes after a level an affix is due at: while the artifact holds fewer than four, a new one drawn by the
// Wiki's weights from those it does not hold yet, valued by one of its tiers; at four, one of them raised by a tier of its
// Value, chosen evenly
export const enhanceMinorAffixes = ({
  mainAffix,
  minorAffixes,
  minorAffixGroups,
  random,
}: {
  mainAffix: Attribute;
  minorAffixes: readonly AttributeLine[];
  minorAffixGroups: readonly ArtifactMinorAffixGroup[];
  random: () => number;
}): AttributeLine[] => {
  if (minorAffixes.length < MAX_MINOR_AFFIX_COUNT) {
    const group = drawWeightedValue(
      minorAffixGroups
        .filter(
          ({ attribute }) => attribute !== mainAffix && !minorAffixes.some((line) => line.attribute === attribute),
        )
        .map((minorAffixGroup) => ({
          value: minorAffixGroup,
          weight: ArtifactMinorAffixWeightMap[minorAffixGroup.attribute] ?? 0,
        })),
      random,
    );
    return [...minorAffixes, { attribute: group.attribute, value: takeRandom(group.values, random) }];
  }
  const raisedIndex = Math.floor(random() * minorAffixes.length);
  return minorAffixes.map((line, index) => {
    if (index !== raisedIndex) return line;
    const group = minorAffixGroups.find(({ attribute }) => attribute === line.attribute);
    if (!group)
      throw new InvalidOperationError(
        Operation.Update,
        "enhanceMinorAffixes",
        `no tier holds the minor affix ${line.attribute}`,
      );
    return { ...line, value: line.value + takeRandom(group.values, random) };
  });
};
