import { z } from "zod";

// An open review issue as `gh issue list` prints it, the body holding its findings and the run that opened it
export interface ReviewIssue {
  body: string;
  createdAt: Date;
  number: number;
  title: string;
}

export const reviewIssueSchema: z.ZodType<ReviewIssue> = z.object({
  body: z.string(),
  createdAt: z.date(),
  number: z.int().positive(),
  title: z.string().min(1),
});
