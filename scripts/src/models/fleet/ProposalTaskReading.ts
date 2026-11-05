import type { ProposalTask } from "#src/models/fleet/ProposalTask";

// A change's tasks, and the phase it is picked at: the lowest among its open tasks, absent when none is open or none holds
// A phase
export interface ProposalTaskReading {
  pickPhase?: number;
  tasks: ProposalTask[];
}
