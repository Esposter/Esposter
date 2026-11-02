import { describe } from "vitest";

// A count the mocked server moves, which a test awaits up to a value — the server's own events are what it waits on,
// Never a timer
export const createCounter = () => {
  let value = 0;
  let changed = Promise.withResolvers<void>();
  return {
    increment: () => {
      value++;
      changed.resolve();
      changed = Promise.withResolvers<void>();
    },
    reach: async (target: number) => {
      while (value < target) await changed.promise;
    },
    get value() {
      return value;
    },
  };
};

describe.todo(createCounter);
