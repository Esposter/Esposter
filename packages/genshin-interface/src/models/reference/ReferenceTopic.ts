import type { Investigation } from "#src/models/reference/Investigation";

// One part of a component's reference: every investigation run on it, in the order they were run, so no session runs
// One twice, and the questions still open, which the next session starts from
export interface ReferenceTopic {
  investigations: Investigation[];
  openQuestions: string[];
}
