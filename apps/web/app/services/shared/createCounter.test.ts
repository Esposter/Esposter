import { describe } from "vitest";

// A count the mocked server moves, which a test awaits up to a value — the server's own events are what it waits on,
// Never a timer
export const createCounter = () => {
  let value = 0;
  let changed = Promise.withResolvers<void>();
  const reach = async (target: number): Promise<void> => {
    for (;;) {
      if (!(value < target)) return;

      // oxlint-disable-next-line no-await-in-loop -- Each step reads the last: each wait ends on an increment, and the check after it reads the count that increment moved
      await changed.promise;
    }
  };
  return {
    increment: () => {
      value++;
      changed.resolve();
      changed = Promise.withResolvers<void>();
    },
    reach,
    get value() {
      return value;
    },
  };
};

describe.todo(createCounter);
