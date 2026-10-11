// The textures a model names, matched to the files beside it: each found one by the path the world requests it at and
// The file it is read from. A path no file matches is left out, as a texture its release lacks
export interface CharacterPackTextures {
  files: { filePath: string; path: string }[];
}
