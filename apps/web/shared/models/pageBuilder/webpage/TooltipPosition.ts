import { z } from "zod";

export enum TooltipPosition {
  Bottom = "Bottom",
  Left = "Left",
  Right = "Right",
  Top = "Top",
}

export const tooltipPositionSchema = z.enum(TooltipPosition) satisfies z.ZodType<TooltipPosition>;

export const TooltipPositions = Object.values(TooltipPosition);
