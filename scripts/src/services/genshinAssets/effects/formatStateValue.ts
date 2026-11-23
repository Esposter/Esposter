import type { SerializedShaderFloat } from "#src/models/genshinAssets/materials/SerializedShaderFloat";

// A value as its label and its number, and the property that drives it where one does, or "literal" where the shader
// Sets it itself
export const formatStateValue = (label: string, { name, value }: SerializedShaderFloat): string =>
  // eslint-disable-next-line no-restricted-syntax -- a state name, empty for a literal
  `${label}=${value} (${name === "" ? "literal" : name})`;
