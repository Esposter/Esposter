// Where a character's pack is read from: a file by the path the pack layout serves it at, none where the pack holds no
// File there, rejecting where a file it holds fails to arrive, and a key naming the copy it is read from, which changes
// Whenever the copy does
export interface CharacterPackReader {
  key: string;
  readFile: (path: string) => Promise<Blob | undefined>;
}
