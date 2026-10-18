import { describe } from "vitest";

// The reads resolve in microtasks, so one macrotask after the composable is made, every read has landed in its refs
export const flushReads = () =>
  new Promise((resolve) => {
    setTimeout(resolve, 0);
  });

describe.todo("flushReads");
