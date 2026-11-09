import type { RunTasks } from "#vite/models/RunTasks";

import { readTestTasks } from "#vite/services/readTestTasks";

const testTasks = readTestTasks();

export const TEST_TASKS: RunTasks = {
  ...Object.fromEntries(testTasks),
  // The members' tests as a set: the per-member tasks do the caching, so this one only orders them
  "test:all": {
    cache: false,
    command: 'echo "every member tested"',
    dependsOn: testTasks.map(([taskName]) => taskName),
  },
};
