// Where a character's pack is read from: the id of the character the pack is of, and a file by the path the model names it
// at, where the model's path and the terms' path name the pack's model and terms and none is the pack holding no file
// there. A file it holds that fails to arrive rejects, and the key names the copy read, which changes whenever the copy does
export interface CharacterPackReader {
  characterId: number;
  key: string;
  readFile: (path: string) => Promise<Blob | undefined>;
}
