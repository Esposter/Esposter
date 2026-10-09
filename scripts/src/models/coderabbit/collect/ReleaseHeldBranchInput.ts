import type { HeldIssueInput } from "#src/models/coderabbit/collect/HeldIssueInput";

export interface ReleaseHeldBranchInput extends HeldIssueInput {
  cwd: string;
}
