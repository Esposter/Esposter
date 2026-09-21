import { computeSourceTreeHash } from "#src/services/exec/cache/computeSourceTreeHash";
import { computeEnvironmentKey } from "#src/services/exec/snapshot/computeEnvironmentKey";
import { getResult } from "@esposter/shared";
import { createHash } from "node:crypto";
// The task-cache address for one run: a sha256 over the five things that fully determine what it writes to the host
// And to its streams — the resolved command, the provisioned environment (computeEnvironmentKey: the dependency
// Closure plus the sandbox node major, the same key the warm snapshot uses), the working-tree source content
// (computeSourceTreeHash), the write-back mask the run flushes under, and the FORCE_COLOR the child runs with. Two
// Runs share a key iff all five match, so a hit is safe to replay verbatim.
//
// The color level is part of the address because a hit replays the RECORDED streams, and the toolchain's output is a
// Function of FORCE_COLOR (withColorEnv pins it per run: the host's depth for a terminal, "0" for a pipe or a
// Redirected caller). Without it whichever run recorded first answers every later one — a piped agent run leaves a
// Plain recording that a terminal run then replays uncolored, and a terminal run leaves escape codes that a piped
// Caller's captured stdout would carry. Keying on it gives each shape its own entry instead of laundering one
// Recording through the other.
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
  forceColor: string,
): null | string => {
  const sourceTreeHash = computeSourceTreeHash(cwd);
  if (sourceTreeHash === null) return null;
  return getResult(() =>
    // One JSON payload rather than delimiter-joined fields: a delimiter only separates fields that cannot contain
    // It, and POSIX permits newlines in path names — so a newline-joined key hashed the command `"x\n./a"` under no
    // Mask identically to `"x"` under the mask `"./a\n"`, and a hit would replay a flush plan recorded under a
    // Different mask. JSON quotes and escapes every field, so the encoding is injective whatever the content, and it
    // Keeps a string command distinct from its single-element argv form for free.
    createHash("sha256")
      .update(JSON.stringify([computeEnvironmentKey(cwd), sourceTreeHash, command, maskedPaths, forceColor]))
      .digest("hex"),
  ).match(
    (key) => key,
    () => null,
  );
};
