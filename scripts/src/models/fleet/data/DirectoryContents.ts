import type { FileEntry } from "#src/models/fleet/data/FileEntry";

// One directory's direct files and the names of its direct child directories
export interface DirectoryContents {
  directories: string[];
  files: FileEntry[];
}
