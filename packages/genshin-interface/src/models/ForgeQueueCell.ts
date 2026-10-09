import type { ForgeQueueState } from "#src/models/ForgeQueueState";

// One forge queue as the queues tab shows it: its state, the recipe's name when it holds an order, and the words that
// Say how far the order has got, already in the reader's language
export interface ForgeQueueCell {
  id: number;
  name: string;
  progressLabel: string;
  state: ForgeQueueState;
  timeLabel: string;
}
