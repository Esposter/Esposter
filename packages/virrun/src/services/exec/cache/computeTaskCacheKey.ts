import { computeSourceTreeHash } from "@/services/exec/cache/computeSourceTreeHash";
import { computeEnvironmentKey } from "@/services/exec/snapshot/computeEnvironmentKey";
import { getResult } from "@esposter/shared";
import { createHash } from "node:crypto";
// The task-cache address for one run: a sha256 over the three things that fully determine its output — the resolved
// Command, the provisioned environment (computeEnvironmentKey: the dependency closure plus the sandbox node major,
// The same key the warm snapshot uses), and the working-tree source content (computeSourceTreeHash). Two runs share
// A key iff all three match, so a hit is safe to replay verbatim.
// Returns null when the source tree can't be hashed (not a git repo) or the lockfile is missing — either way the
// Caller falls back to running uncached rather than keying on partial state.
export const computeTaskCacheKey = (command: readonly string[] | string, cwd: string): null | string => {
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
      .digest("hex");
  }).match(
    (key) => key,
    () => null,
  );
};
