import { getOrCreate } from "@esposter/shared";

// Each file is read once per reader however many clones it is in
export const memoize = <TValue>(read: (sourceId: string) => TValue): ((sourceId: string) => TValue) => {
  const sourceIdValueMap = new Map<string, TValue>();
  return (sourceId: string) => getOrCreate(sourceIdValueMap, sourceId, () => read(sourceId));
};
