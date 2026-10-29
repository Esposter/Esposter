import { z } from "zod";

export enum StyleState {
  Default = "Default",
  Hover = "Hover",
}

export const styleStateSchema = z.enum(StyleState) satisfies z.ZodType<StyleState>;

export const StyleStates = Object.values(StyleState);
