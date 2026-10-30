import type { Artifact } from "#src/models/artifact/Artifact";
import type { ArtifactDetailStats } from "#src/models/artifact/ArtifactDetailStats";
import type { ArtifactMainAffixCurve } from "#src/models/artifact/ArtifactMainAffixCurve";
import type { Attribute } from "#src/models/character/Attribute";
import type { GameText } from "genshin-text";

import { getArtifactMainAffixValue } from "#src/services/artifact/getArtifactMainAffixValue";
import { formatAttributeValue } from "#src/services/character/formatAttributeValue";
import { getAttributeLabel } from "#src/services/character/getAttributeLabel";

// An affix's value as the Details list writes it, a flat attribute whole and a percentage to one place, with the sign
// An affix adds
const getAffixValue = (attribute: Attribute, value: number): string => `+${formatAttributeValue(attribute, value)}`;

// An artifact's stats for its panel: its main stat's name with its value at its level's curve, and each minor affix in the
// Game's words and form
export const getArtifactDetailStats = (
  artifact: Artifact,
  gameText: GameText,
  artifactMainAffixCurves: readonly ArtifactMainAffixCurve[],
): ArtifactDetailStats => ({
  isLocked: artifact.isLocked,
  mainStat: {
    label: getAttributeLabel(artifact.mainAffix, gameText),
    value: getAffixValue(artifact.mainAffix, getArtifactMainAffixValue(artifact, artifactMainAffixCurves)),
  },
  subStats: artifact.minorAffixes.map(({ attribute, value }) => ({
    label: getAttributeLabel(attribute, gameText),
    value: getAffixValue(attribute, value),
  })),
});
