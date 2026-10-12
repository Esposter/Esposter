import type { ReviewRunJob } from "#src/models/review/ReviewRunJob";

import { reviewRunJobSchema } from "#src/models/review/ReviewRunJob";
import { runGh } from "#src/services/shared/runGh";
import { getResult, jsonDateParse } from "@esposter/shared";
import { z } from "zod";

const runJobsSchema: z.ZodType<{ jobs: ReviewRunJob[] }> = z.object({ jobs: z.array(reviewRunJobSchema) });

// A workflow run's jobs as GitHub reports them. A run that cannot be read reports none, so a deleted run holds nothing.
export const getRunJobs = (runId: string): ReviewRunJob[] =>
  getResult(() => runJobsSchema.parse(jsonDateParse(runGh(["run", "view", runId, "--json", "jobs"])))).match(
    ({ jobs }) => jobs,
    () => [],
  );
