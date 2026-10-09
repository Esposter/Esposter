// Where a character's pack is read from: a file by the path the pack layout serves it at, and a key naming the copy it
// Is read from, which changes whenever the copy does
export interface CharacterPackReader {
  key: string;
  readFile: (path: string) => Promise<Blob>;
}
