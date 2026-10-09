import type { EngineInterface } from "claude-code";

import type { WardRecord } from "../../../types";

export const readRecords = async ($: EngineInterface, path: string): Promise<Record<string, WardRecord>> =>
  (await $.fs.exists(path))
    ? // oxlint-disable-next-line no-restricted-properties -- The records hold numbers and ids, no date, and a mod cannot import the shared reviver
      (JSON.parse(await $.fs.read(path)) as Record<string, WardRecord>)
    : {};
