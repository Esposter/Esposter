import { TooltipPositions } from "#shared/models/pageBuilder/webpage/TooltipPosition";
import { TOOLTIP_CLASS } from "#shared/services/pageBuilder/webpage/tooltip/constants";
import { getTooltipPositionClass } from "#shared/services/pageBuilder/webpage/tooltip/getTooltipPositionClass";
import { TooltipPositionCssMap } from "#shared/services/pageBuilder/webpage/tooltip/TooltipPositionCssMap";

// The tip shows while its trigger is hovered or holds focus, on the side its position names
export const getTooltipCss = () =>
  [
    `.${TOOLTIP_CLASS}{position:relative;display:inline-block}`,
    `.${TOOLTIP_CLASS}>[role=tooltip]{position:absolute;z-index:1;visibility:hidden;padding:0.25rem 0.5rem;border-radius:0.25rem;background-color:#111;color:#fff;font-size:0.875rem;white-space:nowrap}`,
    `.${TOOLTIP_CLASS}:hover>[role=tooltip],.${TOOLTIP_CLASS}:focus-within>[role=tooltip]{visibility:visible}`,
    ...TooltipPositions.map(
      (position) => `.${getTooltipPositionClass(position)}>[role=tooltip]{${TooltipPositionCssMap[position]}}`,
    ),
  ].join("");
