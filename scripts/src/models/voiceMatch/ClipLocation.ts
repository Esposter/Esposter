import type { AkpkEntry } from "#src/models/voiceMatch/AkpkEntry";

// Where one clip's bytes are: the package file, and the row inside it
export interface ClipLocation {
  entry: AkpkEntry;
  path: string;
}
