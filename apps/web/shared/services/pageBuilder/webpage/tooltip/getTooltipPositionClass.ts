import type { TooltipPosition } from "#shared/models/pageBuilder/webpage/TooltipPosition";

import { TOOLTIP_CLASS } from "#shared/services/pageBuilder/webpage/tooltip/constants";

export const getTooltipPositionClass = (position: TooltipPosition) => `${TOOLTIP_CLASS}-${position.toLowerCase()}`;
