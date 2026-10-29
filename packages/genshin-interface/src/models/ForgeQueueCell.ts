import type { ForgeQueueState } from "#src/models/ForgeQueueState";

// One forge queue as the queues tab shows it: its state, the recipe's name when it holds an order, the words that say how
// Far the order has got, the words of the units ready to obtain, and the words its locked state gives, already in the
// Reader's language
export interface ForgeQueueCell {
  id: number;
  name: string;
  progressLabel: string;
  readyLabel: string;
  state: ForgeQueueState;
  timeLabel: string;
}
