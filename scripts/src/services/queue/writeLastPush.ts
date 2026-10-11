import type { LastPush } from "#src/models/queue/LastPush";

import { LAST_PUSH_PATH } from "#src/services/queue/constants";
import { writeJsonFile } from "#src/services/shared/writeJsonFile";

// Records a push that carried `count` commits and landed `sha`, at the time it landed
export const writeLastPush = (sha: string, count: number): void =>
  writeJsonFile(LAST_PUSH_PATH, { at: Temporal.Now.instant().toString(), count, sha } satisfies LastPush);
