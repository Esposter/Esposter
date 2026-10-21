import type { EngineInterface } from "claude-code";

import type { WardRecord } from "../../../types";

import { parseRecords } from "./parseRecords";

// The records as the file holds them, none when it does not yet exist. A declaration, not an arrow: the hooks module's
// bundle follows an imported helper that takes `$` only into a function declaration
export async function readRecords($: EngineInterface, path: string): Promise<Record<string, WardRecord>> {
  return (await $.fs.exists(path)) ? parseRecords(await $.fs.read(path)) : {};
}
