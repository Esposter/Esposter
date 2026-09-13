import type { CheckStatus } from "#src/models/coderabbit/collect/CheckStatus";

import { CHECK_NAME } from "#src/services/coderabbit/collect/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { spawnSync } from "node:child_process";

// `gh pr checks` exits non-zero when any check is pending or failed, which is precisely the state this read is
// For — so the exit code is ignored and only the JSON on stdout is read.
export const readCheckStatus = (pullRequest: number): CheckStatus | undefined => {
  const { stdout } = spawnSync("gh", ["pr", "checks", pullRequest.toString(), "--json", "name,bucket,description"], {
    encoding: "utf8",
  });
  if (!stdout.trim()) return undefined;
  return parseMachineJson<CheckStatus[]>(stdout).find(({ name }) => name === CHECK_NAME);
};
