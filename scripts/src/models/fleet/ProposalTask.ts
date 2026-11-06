// One task of a change's tasks.md: its number, whether its checkbox is ticked, and the phase it holds, its marker's or
// Else its change's, absent when neither names one
export interface ProposalTask {
  isDone: boolean;
  number: string;
  phase?: number;
}
