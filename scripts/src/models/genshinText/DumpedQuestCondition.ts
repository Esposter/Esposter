// A condition a quest step finishes on, as the reader finds it by its shape: its type's code and its parameters
export interface DumpedQuestCondition {
  parameters: (number | string)[];
  type: string;
}
