import { runGh } from "#src/services/coderabbit/shared/runGh";

// One writer for the pull request's conversation — every marker, verdict and probe lands through it. Whether a
// Refusal is fatal is the caller's to say: a marker lost is a fact lost, a verdict lost is re-attempted next run.
export const postComment = (pullRequest: number, body: string): string =>
  runGh(["pr", "comment", pullRequest.toString(), "--body", body]);
