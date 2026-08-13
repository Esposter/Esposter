import { describe } from "vitest";

// A read the test holds open: the query stays in flight until `resolveQuery` is called, which is what lets a
// Suite move the current key underneath a response that has not landed yet.
export const createPendingQuery = <TData>(data: TData): { query: () => Promise<TData>; resolveQuery: () => void } => {
  const { promise, resolve }: PromiseWithResolvers<TData> = Promise.withResolvers();
  return {
    query: () => promise,
    resolveQuery: () => {
      resolve(data);
    },
  };
};

describe.todo("createPendingQuery");
