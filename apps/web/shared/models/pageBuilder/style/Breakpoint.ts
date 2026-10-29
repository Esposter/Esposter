import { z } from "zod";

// Desktop-first, after Webflow's: Desktop is the base every width reads unless a narrower breakpoint overrides it
export enum Breakpoint {
  Desktop = "Desktop",
  Tablet = "Tablet",
  Mobile = "Mobile",
}

export const breakpointSchema = z.enum(Breakpoint) satisfies z.ZodType<Breakpoint>;

export const Breakpoints = Object.values(Breakpoint);
