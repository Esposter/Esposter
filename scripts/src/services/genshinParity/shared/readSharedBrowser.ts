import type { SharedBrowser } from "#src/models/genshinParity/shared/SharedBrowser";

import { SHARED_BROWSER_PATH } from "#src/services/genshinParity/shared/constants";
import { parseSharedBrowser } from "#src/services/genshinParity/shared/parseSharedBrowser";
import { getResult } from "@esposter/shared";
import { readFileSync } from "node:fs";

// The shared browser `browser start` wrote, or nothing when none was started, since a command then launches its own
export const readSharedBrowser = (): SharedBrowser | undefined =>
  getResult(() => readFileSync(SHARED_BROWSER_PATH, "utf8")).match(parseSharedBrowser, () => undefined);
