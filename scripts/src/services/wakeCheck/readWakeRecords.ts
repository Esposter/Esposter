import { jsonDateParse } from "@esposter/shared";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";

// What one test file left for the wake check (`apps/web/server/trpc/liveTopicWakeCheck.test.ts`). Its shape is the writer's
export interface WakeRecord {
  called: string[];
  file: string;
  watched: string[];
}

// Where the shards' records are merged, under the root `.vitest` the sharded run keeps out of git
export const WAKE_RECORD_DIRECTORY = join(REPOSITORY_ROOT, ".vitest", "wake-check");

export const readWakeRecords = (): WakeRecord[] =>
  existsSync(WAKE_RECORD_DIRECTORY)
    ? readdirSync(WAKE_RECORD_DIRECTORY).map((name) =>
        jsonDateParse<WakeRecord>(readFileSync(join(WAKE_RECORD_DIRECTORY, name), "utf8")),
      )
    : [];
