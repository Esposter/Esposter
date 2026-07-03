import { VIRRUN_SOURCE_MIRROR_TREE_DIRECTORY_NAME } from "@/services/exec/wsl/constants";
import { getWslSourceMirrorEntryPath } from "@/services/exec/wsl/getWslSourceMirrorEntryPath";
// The ext4 mirror's Linux path for a host cwd: `<entry>/tree`, the `--overlay-src` read-only lower and the base for the
// PATH prepend. It is the `tree/` leaf of the self-contained mirror entry (getWslSourceMirrorEntryPath) rather than the
// Entry root, so the lower stays a byte-exact copy of the working tree — the sibling `origin` marker the reaper keys on
// Never shows through into the sandbox source view. ensureWslSourceMirror rsyncs into it; createOsExecOptions prepends
// Its `node_modules/.bin` so a bare command resolves the overlaid (correct-platform) binary before the /mnt/c host bin
// That WSL interop leaks onto PATH.
export const getWslSourceMirrorPath = (cwd: string): string =>
  `${getWslSourceMirrorEntryPath(cwd)}/${VIRRUN_SOURCE_MIRROR_TREE_DIRECTORY_NAME}`;
