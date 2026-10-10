import { SITE_NAME } from "@esposter/shared";
import { homedir } from "node:os";
import { join } from "node:path";

// Where the developer's extracted official packs sit when GENSHIN_CHARACTER_PACKS_DIRECTORY names nowhere else: one
// Folder a character, named by its id, outside the repository since the packs' terms forbid redistributing them
export const GENSHIN_CHARACTER_PACKS_DEFAULT_DIRECTORY: string = join(
  homedir(),
  SITE_NAME,
  "character-packs",
  "extracted",
);
// A folder named by a character's id, the only folders of the packs' directory that are read
export const CHARACTER_ID_REGEX = /^[1-9]\d*$/u;
