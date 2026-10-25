import type { GcsimCharacter } from "#src/models/genshinAssets/kits/gcsim/GcsimCharacter";
import type { GoToken } from "#src/models/genshinAssets/kits/gcsim/GoToken";

// A cited file as a cited line's value is read from it: its name below the folder as the overlay cites it, the folder's
// Character whose constants and queue calls its names resolve through, and the file's lines and tokens
export interface CitedFile {
  fileName: string;
  gcsim: GcsimCharacter;
  lines: readonly string[];
  tokens: readonly GoToken[];
}
