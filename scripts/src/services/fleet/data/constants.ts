import { SITE_NAME } from "@esposter/shared";
import { homedir } from "node:os";
import { join } from "node:path";

// The folders a copy takes by default; frames and tmp are never copied, since frames are rebuilt where they are used
export const DATA_FOLDERS: readonly string[] = ["extracted", "text", "references", "captures", "city-areas", "plans"];
export const EXCLUDED_FOLDERS: readonly string[] = ["frames", "tmp"];
// The stats in flight at once, so a directory of any size holds one bounded batch of promises
export const STAT_CONCURRENCY = 64;
export const DEFAULT_PARITY_DIRECTORY: string = join(homedir(), SITE_NAME, "genshin-parity");
export const PEERS_FILE_PATH: string = join(homedir(), `.${SITE_NAME.toLowerCase()}`, "peers.json");
export const SUCCESS_EXIT_CODE = 0;
export const FAILURE_EXIT_CODE = 1;
export const MEBIBYTE: number = 2 ** 20;
export const MILLISECONDS_PER_SECOND: number = Temporal.Duration.from({ seconds: 1 }).total("milliseconds");
