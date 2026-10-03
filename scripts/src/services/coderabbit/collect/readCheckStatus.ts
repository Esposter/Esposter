import type { CheckStatus } from "#src/models/coderabbit/collect/CheckStatus";

import { CHECK_NAME } from "#src/services/coderabbit/collect/constants";
import { GITHUB_OUTAGE_REGEX } from "#src/services/shared/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { spawnSync } from "node:child_process";

// `gh pr checks` exits non-zero when any check is pending or failed, which is precisely the state this read is
// For — so the exit code is ignored and only the JSON on stdout is read. An outage leaves stdout as empty as a pull
// Request with no check, so it is thrown rather than read as one: the cycle retries it instead of failing red.
export const readCheckStatus = (pullRequest: number): CheckStatus | undefined => {
  const { stderr, stdout } = spawnSync(
    "gh",
    ["pr", "checks", pullRequest.toString(), "--json", "name,bucket,description"],
    { encoding: "utf8" },
  );
  if (GITHUB_OUTAGE_REGEX.test(stderr)) throw new InvalidOperationError(Operation.Read, "coderabbit", stderr);
  else if (stdout.trim()) return parseMachineJson<CheckStatus[]>(stdout).find(({ name }) => name === CHECK_NAME);
  else return undefined;
};
