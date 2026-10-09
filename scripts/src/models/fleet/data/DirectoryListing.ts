import type { FileEntry } from "#src/models/fleet/data/FileEntry";

// The files one entry lists, keyed by the entry's path from the parity directory: a directory's direct files, or a
// Single-file entry's own file
export interface DirectoryListing {
  directory: string;
  files: FileEntry[];
}
