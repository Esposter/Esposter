import type { JobAnnotation } from "#src/models/coderabbit/guard/JobAnnotation";

import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { runGh } from "#src/services/shared/runGh";

// A job's annotations, off the check run the job is: a red job carries a handful, well inside one page
export const readJobAnnotations = (jobId: number): JobAnnotation[] =>
  parseMachineJson<JobAnnotation[]>(runGh(["api", `repos/{owner}/{repo}/check-runs/${jobId}/annotations`]));
