import { z } from "zod";

// The breakpoints a node's style is set at: base is desktop, and tablet and mobile override it at narrower widths
export const StyleBreakpoint = { Base: "Base", Mobile: "Mobile", Tablet: "Tablet" } as const;
export type StyleBreakpoint = (typeof StyleBreakpoint)[keyof typeof StyleBreakpoint];

export const styleBreakpointSchema = z.enum(StyleBreakpoint) satisfies z.ZodType<StyleBreakpoint>;
