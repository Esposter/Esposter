import { SITE_NAME } from "@esposter/shared";
import { homedir } from "node:os";
import { join } from "node:path";

// The developer's parity directory when GENSHIN_PARITY_DIRECTORY names nowhere else, and its folder the game's exports
// Are extracted into, one folder a component, outside the repository since nothing taken from the game's files ships
export const GENSHIN_PARITY_DEFAULT_DIRECTORY: string = join(homedir(), SITE_NAME, "genshin-parity");
export const SCENE_EXPORTS_FOLDER = "extracted";
// The folder of a component's own its meshes and textures sit in, by the export folders its layout names them under
export const SCENE_EXPORT_ASSETS_FOLDER = "assets";
