import type { CharacterShadingInputs } from "#src/models/character/CharacterShadingInputs";

// The inputs a caller hands over, each one it has. A key it leaves undefined takes the default beneath it, so a caller
// Passes the keys it computes as they are, without dropping the ones it holds no value for
export type CharacterShadingOverrides = {
  [Key in keyof CharacterShadingInputs]?: CharacterShadingInputs[Key] | undefined;
};
