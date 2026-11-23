import type { SinsResult } from "../../models/SinsResult";

import { SinStatusKind } from "../../models/SinStatusKind";
import { checkIsSinsResult } from "./checkIsSinsResult";

// The node script writes one JSON result when it exits cleanly, so a run that exited otherwise never reaches this. A
// Result that is not the shape the script writes reads as a failed run, the same as a run that exited otherwise
export const parseSinsResult = (stdout: string): SinsResult => {
  // `packages/genshin-mods/package.json` has no @esposter/shared dependency, so jsonDateParse is not importable here,
  // And SinsResult (src/models/SinsResult.ts)
  // oxlint-disable-next-line no-restricted-properties -- holds no Date a revival would produce
  const result: unknown = JSON.parse(stdout);
  return checkIsSinsResult(result) ? result : { result: SinStatusKind.Failed };
};
