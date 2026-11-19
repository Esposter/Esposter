import { DATA_ROOT } from "@esposter/shared-node/cache";
import { join } from "node:path";

// The official packs as the owner extracted them, one folder per avatar id, in the folder the characters spec names
export const CHARACTER_PACKS_DIRECTORY: string = join(DATA_ROOT, "character-packs", "extracted");
// The folder each pack publishes under in the public game data bucket, one folder per avatar id beneath it
export const CHARACTER_PACKS_PREFIX = "characterPacks";
// The manifest every pack folder holds beside its files, which the index is read from and which publishes with them
export const CHARACTER_PACK_MANIFEST_NAME = "manifest.json";
