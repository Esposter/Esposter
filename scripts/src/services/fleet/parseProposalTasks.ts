import type { ProposalTaskReading } from "#src/models/fleet/ProposalTaskReading";

// `- [ ] 3.1 [phase 6] Text`: a checkbox, the task's number and an optional marker naming a phase other than its
// Change's. A marker past the last phase is no marker, so its line reads as an ordinary task
const TASK_REGEX = /^- \[(?<mark>[ x])\] (?<number>\d+(?:\.\d+)+)(?: \[phase (?<phase>[0-7])\])?(?!\S)/gmu;

// A change's tasks from its tasks.md text, each holding its marker's phase or else the change's x-phase, and the change's
// Pick phase: the lowest among its open tasks. A done task's marker is read but never counts for the pick
export const parseProposalTasks = (text: string, changePhase: number | undefined): ProposalTaskReading => {
  const tasks = Array.from(text.matchAll(TASK_REGEX), ({ groups }) => ({
    isDone: groups?.mark === "x",
    number: groups?.number ?? "",
    phase: groups?.phase === undefined ? changePhase : Number(groups.phase),
  }));
  const openPhases = tasks.filter(({ isDone }) => !isDone).flatMap(({ phase }) => (phase === undefined ? [] : [phase]));
  return { pickPhase: openPhases.length === 0 ? undefined : Math.min(...openPhases), tasks };
};
