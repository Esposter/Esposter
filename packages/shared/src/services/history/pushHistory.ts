import type { History } from "#src/models/history/History";

// A new entry joins the past, drops the future it no longer leads to, and drops the oldest entries past the limit
export const pushHistory = <T>(history: History<T>, entry: T): History<T> => {
  const past = [...history.past, entry];
  return { future: [], limit: history.limit, past: past.slice(Math.max(past.length - history.limit, 0)) };
};
