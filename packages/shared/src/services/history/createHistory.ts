import type { History } from "#src/models/history/History";

// An empty history bounded by the limit the consumer passes
export const createHistory = <T>(limit: number): History<T> => ({ future: [], limit, past: [] });
