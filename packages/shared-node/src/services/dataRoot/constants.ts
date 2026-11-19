import { homedir } from "node:os";
import { isAbsolute, join } from "node:path";

// The folder each root keeps this workspace's files in, named for what it holds rather than for the product, so the
// Paths outlive a rename and read the same in every checkout
const NAMESPACE = "workspace-data";
// The XDG base directory spec's rule: a variable set to an absolute folder wins, and one unset, empty or relative falls
// Back to the spec's default under the home folder
const getBaseDirectory = (variableName: string, ...defaultSegments: string[]): string => {
  const baseDirectory = process.env[variableName] ?? "";
  return isAbsolute(baseDirectory) ? baseDirectory : join(homedir(), ...defaultSegments);
};

// What a machine keeps and cannot fetch again. A path under it is written relative to it
export const DATA_ROOT: string = join(getBaseDirectory("XDG_DATA_HOME", ".local", "share"), NAMESPACE);
// What a machine can fetch again, shared by every checkout on it: a cache under a checkout's `node_modules` is empty in
// Every new worktree and every ephemeral run, so it is fetched again each time; each consumer derives its own folder
export const CACHE_ROOT: string = join(getBaseDirectory("XDG_CACHE_HOME", ".cache"), NAMESPACE);
// What describes the machine itself rather than any content it holds
export const STATE_ROOT: string = join(getBaseDirectory("XDG_STATE_HOME", ".local", "state"), NAMESPACE);
// The Windows AnimeStudio CLI's folder, unpacked under Downloads until genshin-pipeline-provenance removes that default
export const WINDOWS_ANIMESTUDIO_DIRECTORY: string = join(homedir(), "Downloads", "AnimeStudio");
