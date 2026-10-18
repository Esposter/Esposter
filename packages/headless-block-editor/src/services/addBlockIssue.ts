import type { z } from "zod";

// Refuses the value at a path, with the message the refusal reports
export const addBlockIssue = (context: z.RefinementCtx, message: string, path: PropertyKey[]): void => {
  context.addIssue({ code: "custom", message, path });
};
