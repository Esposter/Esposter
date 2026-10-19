import { z } from "zod";

// The breakpoints a node's style is set at: base is desktop, and tablet and mobile override it at narrower widths
export enum StyleBreakpoint {
  Base = "Base",
  Tablet = "Tablet",
  Mobile = "Mobile",
}

export const styleBreakpointSchema = z.enum(StyleBreakpoint) satisfies z.ZodType<StyleBreakpoint>;
