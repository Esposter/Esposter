import type { EngineInterface } from "claude-code";

import type { WardRecord } from "../../../types";

import { parseRecords } from "./parseRecords";

// The records as the file holds them, none when it does not yet exist
export const readRecords = async ($: EngineInterface, path: string): Promise<Record<string, WardRecord>> =>
  (await $.fs.exists(path)) ? parseRecords(await $.fs.read(path)) : {};
