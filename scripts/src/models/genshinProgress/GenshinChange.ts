import type { ProposalTask } from "#src/models/fleet/ProposalTask";

// A Genshin change as the report counts it: its metadata's needs, its blocker and its phase, and its task list with each
// Task's phase
export interface GenshinChange {
  needs: string[];
  phase?: number;
  tasks: ProposalTask[];
  waiting: string;
}
