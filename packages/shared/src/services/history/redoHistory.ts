import type { History } from "#src/models/history/History";
import type { HistoryStep } from "#src/models/history/HistoryStep";

import { pushHistory } from "#src/services/history/pushHistory";

// The oldest future entry, the last one undone, moves back onto the past; redoing keeps the rest of the future
export const redoHistory = <T>(history: History<T>): HistoryStep<T> => {
  const [entry] = history.future;
  if (entry === undefined) return { history };
  return { entry, history: { ...pushHistory(history, entry), future: history.future.slice(1) } };
};
