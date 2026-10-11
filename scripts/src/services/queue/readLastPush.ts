import type { LastPush } from "#src/models/queue/LastPush";

import { lastPushSchema } from "#src/models/queue/LastPush";
import { LAST_PUSH_PATH } from "#src/services/queue/constants";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { getResult } from "@esposter/shared";
import { existsSync, readFileSync } from "node:fs";

// The last push this machine recorded, or undefined when it has pushed nothing yet or the file is not one
export const readLastPush = (): LastPush | undefined =>
  existsSync(LAST_PUSH_PATH)
    ? getResult(() => lastPushSchema.safeParse(parseMachineJson(readFileSync(LAST_PUSH_PATH, "utf8")))).match(
        (result) => (result.success ? result.data : undefined),
        () => undefined,
      )
    : undefined;
