import { z } from "zod";

// The text a label-kind component holds, which the reader writes decoded, so a label that comes back holding markup is refused
export const labelContentSchema: z.ZodString = z.string();
