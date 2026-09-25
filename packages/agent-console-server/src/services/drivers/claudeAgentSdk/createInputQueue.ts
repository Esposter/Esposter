import type { InputQueue } from "#src/models/claudeAgentSdk/InputQueue";

// The streaming input a session's query reads its prompts from: open for as long as the session is, so one query
// Carries every turn. A prompt pushed while the agent is busy waits here until the SDK asks for the next, and a read
// Made while nothing is queued waits for the next push — or for the close, which ends every read still waiting
export const createInputQueue = <T>(): InputQueue<T> => {
  let items: T[] = [];
  let pendingReads: ((result: IteratorResult<T, undefined>) => void)[] = [];
  let isClosed = false;

  const next = (): Promise<IteratorResult<T, undefined>> => {
    const [item, ...restItems] = items;
    if (item !== undefined) {
      items = restItems;
      return Promise.resolve({ done: false, value: item });
    } else if (isClosed) return Promise.resolve({ done: true, value: undefined });
    else
      return new Promise((resolve) => {
        pendingReads = [...pendingReads, resolve];
      });
  };

  return {
    close: () => {
      isClosed = true;
      const closedReads = pendingReads;
      pendingReads = [];
      for (const closedRead of closedReads) closedRead({ done: true, value: undefined });
    },
    iterable: { [Symbol.asyncIterator]: () => ({ next }) },
    push: (item) => {
      const [pendingRead, ...restPendingReads] = pendingReads;
      if (pendingRead) {
        pendingReads = restPendingReads;
        pendingRead({ done: false, value: item });
      } else items = [...items, item];
    },
  };
};
