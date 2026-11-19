import { SITE_NAME } from "@esposter/shared";
import { homedir } from "node:os";
import { join } from "node:path";

// The one folder a machine's data lives under: the download cache, the parity folder, the tools and the fleet's copy of
// The parity folder each derive from it, so no path restates the home folder. A path under it is written relative to it
export const DATA_ROOT: string = join(homedir(), SITE_NAME);
// The Windows AnimeStudio CLI's folder, unpacked under Downloads until genshin-pipeline-provenance removes that default
export const WINDOWS_ANIMESTUDIO_DIRECTORY: string = join(homedir(), "Downloads", "AnimeStudio");
