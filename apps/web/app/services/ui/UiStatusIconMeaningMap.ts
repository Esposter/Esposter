import type { UiStatus } from "@/models/ui/UiStatus";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { UiToken } from "@/models/ui/UiToken";

// A status is always a mark as well as a colour, so it reads for a reader who cannot tell the colours apart
export const UiStatusIconMeaningMap = {
  [UiToken.Error]: UiIconMeaning.Failure,
  [UiToken.Info]: UiIconMeaning.Info,
  [UiToken.Success]: UiIconMeaning.Success,
  [UiToken.Warning]: UiIconMeaning.Warning,
} as const satisfies Record<UiStatus, UiIconMeaning>;
