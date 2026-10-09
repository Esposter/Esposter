import type { FailureSignature } from "#src/models/coderabbit/collect/FailureSignature";
import type { CollectorJobView } from "#src/models/coderabbit/guard/CollectorJobView";
import type { JobAnnotation } from "#src/models/coderabbit/guard/JobAnnotation";

import { CI_FAILURE_CONCLUSION } from "#src/services/coderabbit/collect/constants";
import { getFailureSignature } from "#src/services/coderabbit/collect/getFailureSignature";
import { FAILURE_ANNOTATION_LEVEL, RUNNER_EXIT_CODE_REGEX } from "#src/services/coderabbit/guard/constants";

// What a red collect job failed on: the step that failed and the first error line it left, read off the job's
// Annotations in the order its log wrote them — the collector's own line (`writeErrorAnnotation`) before the runner's
// Exit code, which is the same for every red and stands only for a step that died without a line of its own. Two reds
// Are the same red when both match
export const getRunFailureSignature = (job: CollectorJobView, annotations: JobAnnotation[]): FailureSignature => {
  const failedStep = job.steps.find(({ conclusion }) => conclusion === CI_FAILURE_CONCLUSION)?.name ?? "";
  const errorLines = annotations
    .filter(({ annotation_level }) => annotation_level === FAILURE_ANNOTATION_LEVEL)
    .toSorted((firstAnnotation, secondAnnotation) => firstAnnotation.start_line - secondAnnotation.start_line)
    .map(({ message }) => message);
  const errorLine = errorLines.find((line) => !RUNNER_EXIT_CODE_REGEX.test(line)) ?? errorLines.at(0) ?? "";
  return getFailureSignature(failedStep, [errorLine]);
};
