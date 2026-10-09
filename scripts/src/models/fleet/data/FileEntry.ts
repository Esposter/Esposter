// A file directly inside a directory, its size in bytes and its mtime in whole seconds
export interface FileEntry {
  mtime: number;
  name: string;
  size: number;
}
