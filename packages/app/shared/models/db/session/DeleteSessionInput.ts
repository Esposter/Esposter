import { z } from "zod";

export const deleteSessionInputSchema = z.string().min(1);
export type DeleteSessionInput = z.infer<typeof deleteSessionInputSchema>;
