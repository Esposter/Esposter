// Where the browser keeps the packs' files, by a path of parts: a file read as it was written, or absent; a file written
// Over whatever was there; and a path removed with every file below it
export interface CharacterPackStorage {
  read: (path: readonly string[]) => Promise<Blob | undefined>;
  remove: (path: readonly string[]) => Promise<void>;
  write: (path: readonly string[], blob: Blob) => Promise<void>;
}
