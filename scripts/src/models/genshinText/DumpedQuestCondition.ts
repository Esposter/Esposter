// A condition a quest step finishes on, as the reader finds it by its shape: its type's code, its parameters and the one
// Text it carries besides the code, "" where it carries none (a game time tick's window of hours)
export interface DumpedQuestCondition {
  parameters: (number | string)[];
  text: string;
  type: string;
}
