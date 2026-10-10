import type { MainCheck } from "#src/models/coderabbit/collect/MainCheck";

// A red run on `main`'s head beside the workflow file it was listed by (`readRedMainChecks`), which says where the files
// Its failure names are read when the queue runs nothing of that workflow (`readFailurePaths`)
export interface RedMainCheck extends MainCheck {
  workflowFile: string;
}
