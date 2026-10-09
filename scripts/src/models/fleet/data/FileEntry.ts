// A file an entry lists, its name relative to the entry (empty for a single-file entry), its size in bytes and its mtime
// In whole seconds
export interface FileEntry {
  mtime: number;
  name: string;
  size: number;
}
