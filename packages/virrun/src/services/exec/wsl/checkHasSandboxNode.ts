import { NODE_EXECUTABLE } from "#src/services/exec/wsl/constants";
import { getWslUncPath } from "#src/services/exec/wsl/getWslUncPath";
import { existsSync } from "node:fs";
import { join } from "node:path";
// Whether the node install a login capture named is still on the distro — read straight over the 9p bridge
// (getWslUncPath), so the check costs a stat rather than the login-shell spawn it is guarding against.
//
// The executable, not its directory: a node manager that removed a version can leave the directory behind, and the
// Capture's whole claim is that this PATH resolves `node`. Nothing else in the capture is worth checking — the rest of
// The entries are the distro's own system directories, and a node manager's ephemeral per-shell directory is dead by
// Construction the moment the capture shell exits, so a missing one there means nothing.
export const checkHasSandboxNode = (nodeDirectory: string): boolean =>
  existsSync(join(getWslUncPath(nodeDirectory), NODE_EXECUTABLE));
