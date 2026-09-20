import type { StatusLine } from "#src/models/StatusLine";

import { PLUGIN_MARKER } from "#src/services/constants";

// Ours whether it points at the launcher or at a script path an earlier install pasted by hand
export const checkIsPluginStatusLine = (statusLine: StatusLine | undefined): boolean =>
  statusLine?.command.includes(PLUGIN_MARKER) ?? false;
