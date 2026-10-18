import type { Artifact } from "#src/models/artifact/Artifact";
import type { Character } from "#src/models/character/Character";

// A character wears the artifact in its slot in place of the piece it held there, which goes back to the caller, since
// The bag is the caller's. A character wears one piece a slot, so the only one an equip can displace is its own slot's
export const equipCharacterArtifact = (
  character: Character,
  artifact: Artifact,
): { character: Character; displaced: Artifact | undefined } => {
  const displaced = character.artifacts.find(({ slot }) => slot === artifact.slot);
  return {
    character: {
      ...character,
      artifacts: displaced
        ? character.artifacts.map((worn) => (worn === displaced ? artifact : worn))
        : [...character.artifacts, artifact],
    },
    displaced,
  };
};
