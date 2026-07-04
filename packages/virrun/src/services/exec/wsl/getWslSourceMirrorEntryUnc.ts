import { VIRRUN_SOURCES_DIRECTORY_NAME } from "@/services/exec/wsl/constants";
import { getSourceMirrorKey } from "@/services/exec/wsl/getSourceMirrorKey";
import { getWslNativeCacheRoot } from "@/services/exec/wsl/getWslNativeCacheRoot";
import { join } from "node:path";
// The ext4 mirror entry as a Windows UNC (`\\wsl.localhost\...\sources\<sha256(cwd)>`) — the host-side view of the
// Same entry getWslSourceMirrorEntryPath addresses Linux-side. The planner reads/stages the manifest and the sync's
// Temp list files through this path with plain node:fs (one small-file round-trip each, unlike the per-source-file
// 9p walk the mirror exists to avoid), exactly as reapAbandonedSourceMirrors already reads `origin` markers.
export const getWslSourceMirrorEntryUnc = (cwd: string): string =>
  join(getWslNativeCacheRoot(), VIRRUN_SOURCES_DIRECTORY_NAME, getSourceMirrorKey(cwd));
