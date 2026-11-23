// The distinct ids one field names across a set of messages, where an absent id names nothing
export const getDistinctIds = <T>(ids: (null | T)[]) => [...new Set(ids.filter((id): id is T => Boolean(id)))];
