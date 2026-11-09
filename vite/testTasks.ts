import type { RunTasks } from "#vite/models/RunTasks";

import { PNPM_STATE_PATTERNS, TEST_REWRITTEN_PATTERNS } from "#vite/constants";
import { readTestTasks } from "#vite/services/readTestTasks";

const testTasks = readTestTasks();

// What a root run writes: the blob, the coverage report and every member's own caches and generated directories
const COVERAGE_REWRITTEN_PATTERNS = [".vitest/**", ...TEST_REWRITTEN_PATTERNS.map((pattern) => `**/${pattern}`)];

export const TEST_TASKS: RunTasks = {
  ...Object.fromEntries(testTasks),
  // CI's coverage shard, run from the root as the sharded suite is: CI appends `--shard=i/n`, which is part of the key, so
  // Each shard keeps an entry of its own. A hit restores the blob the merge job reads, so a replayed shard uploads what a
  // Run would have. The default reporter sits beside the blob on purpose: blob alone prints only where it wrote, so a
  // Failing shard would say nothing about which test failed
  "coverage:ci": {
    cache: {
      input: [{ auto: true }, ...PNPM_STATE_PATTERNS, ...COVERAGE_REWRITTEN_PATTERNS.map((pattern) => `!${pattern}`)],
      output: [".vitest/blob/**"],
    },
    command: "pnpm coverage --reporter=default --reporter=blob",
  },
  // The members' tests as a set: the per-member tasks do the caching, so this one only orders them
  "test:all": {
    cache: false,
    command: 'echo "every member tested"',
    dependsOn: testTasks.map(([taskName]) => taskName),
  },
};
