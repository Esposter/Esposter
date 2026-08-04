import { computeSourceTreeHash } from "@/services/exec/cache/computeSourceTreeHash";
import { computeEnvironmentKey } from "@/services/exec/snapshot/computeEnvironmentKey";
import { getResult } from "@esposter/shared";
import { createHash } from "node:crypto";
// The task-cache address for one run: a sha256 over the four things that fully determine what it writes to the host —
// The resolved command, the provisioned environment (computeEnvironmentKey: the dependency closure plus the sandbox
// Node major, the same key the warm snapshot uses), the working-tree source content (computeSourceTreeHash), and the
// Write-back mask the run flushes under. Two runs share a key iff all four match, so a hit is safe to replay verbatim.
//
// The mask is part of the address because a hit replays a RECORDED plan (replayTaskCache → applyFlushPlan) rather
// Than rebuilding one, so it never passes the mask again: an entry recorded under a looser mask — a worktree
// Registered since, or any entry predating the mask itself — would otherwise flush the very ghost paths the mask
// Exists to stop, on every hit until it ages out. Keying on it retires those entries instead of filtering them
// Twice, which is what keeps the mask applied in exactly one place (buildHostFlushPlan).
// Returns null when the source tree can't be hashed (not a git repo) or the lockfile is missing — either way the
// Caller falls back to running uncached rather than keying on partial state.
export const computeTaskCacheKey = (
  command: readonly string[] | string,
  cwd: string,
  maskedPaths: readonly string[],
): null | string => {
  const sourceTreeHash = computeSourceTreeHash(cwd);
  if (sourceTreeHash === null) return null;
  return getResult(() => {
    const environmentKey = computeEnvironmentKey(cwd);
    const commandKey = typeof command === "string" ? command : JSON.stringify(command);
    return createHash("sha256")
      .update(environmentKey)
      .update("\n")
      .update(sourceTreeHash)
      .update("\n")
      .update(commandKey)
      .update("\n")
      .update(maskedPaths.join("\0"))
      .digest("hex");
  }).match(
    (key) => key,
    () => null,
  );
};
