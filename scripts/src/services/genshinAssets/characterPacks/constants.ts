import { homedir } from "node:os";
import { join } from "node:path";

// The official packs as the owner extracted them, one folder per avatar id
export const CHARACTER_PACKS_DIRECTORY: string = join(homedir(), "Downloads", "character-packs", "downloads");
// The folder each pack publishes under in the public game data container, one folder per avatar id beneath it
export const CHARACTER_PACKS_BLOB_PREFIX = "characterPacks";
// The manifest every pack folder holds beside its files, which the index is read from and which publishes with them
export const CHARACTER_PACK_MANIFEST_NAME = "manifest.json";
