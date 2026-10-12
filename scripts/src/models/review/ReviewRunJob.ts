import { z } from "zod";

// One job of a workflow run as `gh run view --json jobs` prints it: its name and whether it has completed
export interface ReviewRunJob {
  name: string;
  status: string;
}

export const reviewRunJobSchema: z.ZodType<ReviewRunJob> = z.object({ name: z.string(), status: z.string() });
