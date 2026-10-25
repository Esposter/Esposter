import { PNG_EXTENSION } from "#src/services/genshinAssets/shared/constants";

// The diffuse maps of the families among a folder's file names. A texture is its material's name followed by its diffuse
// Suffix, so a family's normal and mask maps stay out, and a family never matches another whose name it starts with
const DIFFUSE_SUFFIX = "_Diffuse";

export const matchFamilyTextures = (fileNames: readonly string[], families: readonly string[]): string[] =>
  fileNames.filter(
    (fileName) =>
      fileName.endsWith(PNG_EXTENSION) && families.some((family) => fileName.startsWith(`${family}${DIFFUSE_SUFFIX}`)),
  );
