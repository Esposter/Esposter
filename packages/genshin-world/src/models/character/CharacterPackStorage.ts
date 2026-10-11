// Where the browser keeps the packs' files, by a path of parts: the names directly below a path, none where nothing
// Lies there; a file read as it was written, or absent; a file written over whatever was there; and a path removed
// With every file below it
export interface CharacterPackStorage {
  list: (path: readonly string[]) => Promise<string[]>;
  read: (path: readonly string[]) => Promise<Blob | undefined>;
  remove: (path: readonly string[]) => Promise<void>;
  write: (path: readonly string[], blob: Blob) => Promise<void>;
}
