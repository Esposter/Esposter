import { TIMINGS_DIRECTORY } from "#src/services/timing/constants";
import { join } from "node:path";

// The log's file name: a `:` is not allowed in a Windows file name, so the `ai:` names are written with `-`
export const getLogPath = (command: string): string => join(TIMINGS_DIRECTORY, `${command.replaceAll(":", "-")}.jsonl`);
