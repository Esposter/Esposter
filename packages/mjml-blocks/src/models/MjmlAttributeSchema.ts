import type { z } from "zod";

// The schema of one optional attribute of a component's props, as the per-grammar helper writes it
export type MjmlAttributeSchema = z.ZodOptional<z.ZodType<string>>;
