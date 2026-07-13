import { VIRRUN_WSL_PROCESS_MARKER } from "@/services/exec/wsl/constants";

// A unique `$0` for one run's WSL shell: the shared base plus a random suffix so a reaper (buildWslReapCommand)
// Kills only this run's process group, never a concurrent virrun run or a background warm-cache that shares
// The base marker. The suffix is UUID-only (no spaces/glob/shell metacharacters) so it is safe to embed in both
// The spawn argv and the reaper's `pgrep -f` pattern unquoted.
export const createWslProcessMarker = (): string => `${VIRRUN_WSL_PROCESS_MARKER}-${crypto.randomUUID()}`;
