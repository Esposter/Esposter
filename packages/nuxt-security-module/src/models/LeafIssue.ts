import type { z } from "zod";

export interface LeafIssue {
  issue: z.core.$ZodIssue;
  path: PropertyKey[];
}
