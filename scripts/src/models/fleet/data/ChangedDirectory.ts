import type { FileEntry } from "#src/models/fleet/data/FileEntry";

// A directory whose digest differs between the two sides, with the files the source and the target each list in it
export interface ChangedDirectory {
  directory: string;
  source: FileEntry[];
  target: FileEntry[];
}
