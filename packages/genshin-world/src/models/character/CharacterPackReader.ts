// Where a character's pack is read from: the id of the pack's character, and a file by the path the model names it.
// The model's path and the terms' path name the pack's model and terms; a path the pack holds no file at reads undefined.
// A file it holds that fails to arrive rejects, and the key names the copy read, which changes whenever the copy does
export interface CharacterPackReader {
  characterId: number;
  key: string;
  readFile: (path: string) => Promise<Blob | undefined>;
}
