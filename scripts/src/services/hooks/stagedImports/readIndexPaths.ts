import { runGitBytes } from "#src/services/hooks/stagedImports/runGitBytes";

// Every path the index holds: HEAD's tree with the commit's staged changes applied, so a staged deletion is absent
export const readIndexPaths = (): Set<string> =>
  new Set(runGitBytes(["ls-files", "-z"]).toString("utf8").split("\0").filter(Boolean));
