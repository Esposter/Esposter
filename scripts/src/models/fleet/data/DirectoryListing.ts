import type { FileEntry } from "#src/models/fleet/data/FileEntry";

// The files directly inside one directory, keyed by the directory's path from the parity directory
export interface DirectoryListing {
  directory: string;
  files: FileEntry[];
}
