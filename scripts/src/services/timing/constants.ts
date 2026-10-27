import { SITE_NAME } from "@esposter/shared";
import { homedir } from "node:os";
import { join } from "node:path";

// Each command's run log, one JSON line per run, beside the machine's other state under `{state-root}`
export const TIMINGS_DIRECTORY: string = join(homedir(), `.${SITE_NAME.toLowerCase()}`, "timings");
// The lines a command's log keeps, so the file stays bounded; its median is taken over the successful ones among them
export const TIMING_LOG_LENGTH = 20;
// The successful runs a log needs before a run is compared against it, so a fresh machine never warns
export const MIN_HISTORY = 5;
// A successful run more than this many times its median is reported as slow
export const SLOW_RUN_FACTOR = 2;
