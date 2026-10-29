import { TooltipPosition } from "#shared/models/pageBuilder/webpage/TooltipPosition";

// Where the tip sits against its trigger
export const TooltipPositionCssMap = {
  [TooltipPosition.Bottom]: "top:100%;left:50%;transform:translate(-50%,0.25rem)",
  [TooltipPosition.Left]: "right:100%;top:50%;transform:translate(-0.25rem,-50%)",
  [TooltipPosition.Right]: "left:100%;top:50%;transform:translate(0.25rem,-50%)",
  [TooltipPosition.Top]: "bottom:100%;left:50%;transform:translate(-50%,-0.25rem)",
} as const satisfies Record<TooltipPosition, string>;
