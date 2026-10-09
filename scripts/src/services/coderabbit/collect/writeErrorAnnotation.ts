import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";

// The line a red run failed on, as an annotation on its job: the guard reads it back (`readJobAnnotations`) to tell one
// Red repeated from a run of different ones, where the log's last error line is only the step's exit code. A workflow
// Command's data escapes `%`, and the first line holds no line break to escape. Outside Actions nothing reads it.
export const writeErrorAnnotation = (error: Error): void => {
  if (!process.env.GITHUB_ACTIONS) return;
  console.info(`::error::${(getNonEmptyLines(error.toString()).at(0) ?? "").replaceAll("%", "%25")}`);
};
