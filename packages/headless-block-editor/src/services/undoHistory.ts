import type { History } from "#src/models/History";
import type { HistoryStep } from "#src/models/HistoryStep";

// The newest past entry moves onto the future, to be reapplied first; with an empty past nothing moves
export const undoHistory = <T>(history: History<T>): HistoryStep<T> => {
  const entry = history.past.at(-1);
  if (entry === undefined) return { history };
  return {
    entry,
    history: { future: [entry, ...history.future], limit: history.limit, past: history.past.slice(0, -1) },
  };
};
