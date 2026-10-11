// The textures a model names, matched to the files beside it: each found one by the path the world requests it at and
// The file it is read from, and each path no file matches, as the model names it
export interface CharacterPackTextures {
  files: { filePath: string; path: string }[];
  missingPaths: string[];
}
