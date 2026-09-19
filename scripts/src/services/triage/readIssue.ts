import type { TriageIssue } from "#src/models/triage/TriageIssue";

import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { runGh } from "#src/services/shared/runGh";

// The issue as the labeller reads it: what it says, and what it is already labelled
export const readIssue = (issue: number): TriageIssue =>
  parseMachineJson<TriageIssue>(runGh(["issue", "view", issue.toString(), "--json", "body,labels,title"]));
