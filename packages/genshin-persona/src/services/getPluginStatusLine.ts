import type { StatusLine } from "#src/models/StatusLine";

import { STATUS_LAUNCHER_PATH } from "#src/services/constants";

// Forward slashes so the command reads the same in every shell the status line may be run through
export const getPluginStatusLine = (): StatusLine => ({
  command: `node "${STATUS_LAUNCHER_PATH.replaceAll("\\", "/")}"`,
  type: "command",
});
