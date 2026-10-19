import { z } from "zod";

// The states a node's style is set in: its default, and its hover, which a focusable node also shows on keyboard focus
export enum StyleState {
  Default = "Default",
  Hover = "Hover",
}

export const styleStateSchema = z.enum(StyleState) satisfies z.ZodType<StyleState>;
