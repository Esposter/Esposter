import type { StatusLine } from "#src/models/StatusLine";

import { STATUS_LAUNCHER_PATH } from "#src/services/constants";
import { toForwardSlashes } from "#src/util/toForwardSlashes";

export const getPluginStatusLine = (): StatusLine => ({
  command: `node "${toForwardSlashes(STATUS_LAUNCHER_PATH)}"`,
  type: "command",
});
