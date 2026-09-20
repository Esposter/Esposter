import type { StatusLine } from "#src/models/StatusLine";

import { STATUS_LINE_MARKER } from "#src/services/constants";

// Ours whether it points at the launcher or at a script path an earlier install pasted by hand
export const checkIsPluginStatusLine = (statusLine: StatusLine | undefined): boolean =>
  statusLine?.command.includes(STATUS_LINE_MARKER) ?? false;
