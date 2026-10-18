import type { Artifact } from "#src/models/artifact/Artifact";
import type { ArtifactDetailStats } from "#src/models/artifact/ArtifactDetailStats";
import type { Attribute } from "#src/models/character/Attribute";
import type { GameText } from "genshin-text";

import { ArtifactAffixGameTextKeyMap } from "#src/services/artifact/ArtifactAffixGameTextKeyMap";
import { WHOLE_ATTRIBUTES } from "#src/services/character/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

const getAffixLabel = (attribute: Attribute, gameText: GameText): string => {
  const gameTextKey = ArtifactAffixGameTextKeyMap.get(attribute);
  if (!gameTextKey) throw new InvalidOperationError(Operation.Read, getAffixLabel.name, attribute);
  return gameText[gameTextKey];
};

// A minor affix's value as the Details list writes it, a flat attribute whole and a percentage to one place, with the sign
// An affix adds
const getAffixValue = (attribute: Attribute, value: number): string =>
  WHOLE_ATTRIBUTES.includes(attribute) ? `+${Math.round(value)}` : `+${(value * 100).toFixed(1)}%`;

// An artifact's stats for its panel: its main stat's name, with no value until the main affix's table is read, and each
// Minor affix in the game's words and form
export const getArtifactDetailStats = (artifact: Artifact, gameText: GameText): ArtifactDetailStats => ({
  mainStat: { label: getAffixLabel(artifact.mainAffix, gameText), value: "" },
  subStats: artifact.minorAffixes.map(({ attribute, value }) => ({
    label: getAffixLabel(attribute, gameText),
    value: getAffixValue(attribute, value),
  })),
});
