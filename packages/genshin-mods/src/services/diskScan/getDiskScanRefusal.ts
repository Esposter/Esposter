import { getShellRefusal } from "../shell/getShellRefusal";
import { getScanCommandRefusal } from "./getScanCommandRefusal";

// The scan a Bash command runs from a root or a home folder, named by its command, undefined for every other command
export const getDiskScanRefusal = (command: string): string | undefined =>
  getShellRefusal(command, getScanCommandRefusal);

// The known homes the refusal names. The mod ships without @esposter/shared-node, so the parity folder is spelled here
// As the folder it is on the person's disk, under the XDG data root's default
export const KNOWN_HOME_LINES: string[] = [
  "- the repo, searched with `rg` or `git grep` (both skip node_modules);",
  "- `~/.local/share/workspace-data/genshin-parity`, for game data and captures;",
  "- `~/.claude/genshin-persona`, for the voice;",
  "- a pinned tool (FFmpeg, yt-dlp) through `resolvePinnedTool`;",
  "- a package through `require.resolve` from the package that depends on it.",
];
