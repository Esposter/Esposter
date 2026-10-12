import { ReviewLane } from "#src/models/review/ReviewLane";
import { z } from "zod";

// One finding a reviewer answered with: the line it is on at the window's end, the lane it came from, what is wrong and
// The trigger that makes it a claim (or, for a quality finding, the rule it breaks or what it duplicates)
export interface ReviewFinding {
  file: string;
  lane: ReviewLane;
  line: number;
  summary: string;
  trigger: string;
}

export const reviewFindingSchema: z.ZodType<ReviewFinding> = z.object({
  file: z.string().min(1),
  lane: z.enum(ReviewLane),
  line: z.int().positive(),
  summary: z.string().min(1),
  trigger: z.string().min(1),
});
