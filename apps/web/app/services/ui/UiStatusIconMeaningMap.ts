import type { UiStatus } from "@/models/ui/UiStatus";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

// A status is always a mark as well as a colour, so it reads for a reader who cannot tell the colours apart
export const UiStatusIconMeaningMap = {
  error: UiIconMeaning.Failure,
  info: UiIconMeaning.Info,
  success: UiIconMeaning.Success,
  warning: UiIconMeaning.Warning,
} as const satisfies Record<UiStatus, UiIconMeaning>;
