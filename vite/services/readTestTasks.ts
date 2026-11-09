import type { RunTask } from "#vite/models/RunTask";

import { PNPM_STATE_PATTERNS, ROOT_URL, TEST_REWRITTEN_PATTERNS, TEST_ROOT_DIRECTORIES } from "#vite/constants";
import { getTestTaskName } from "#vite/services/getTestTaskName";
import { readManifest } from "#vite/services/readManifest";
import { readdirSync } from "node:fs";

// Every workspace member with a test script is a task of its own, so a new package gains its task with no edit here.
// The traced inputs are every file its run read, so an edit replays the members whose reads it never touched
export const readTestTasks = (): [string, RunTask][] =>
  [
    "scripts",
    ...TEST_ROOT_DIRECTORIES.flatMap((root) =>
      readdirSync(new URL(`${root}/`, ROOT_URL)).map((directory) => `${root}/${directory}`),
    ),
  ]
    .filter((directory) => readManifest(directory)?.scripts?.test)
    .map((directory) => [
      getTestTaskName(directory),
      {
        cache: {
          input: [
            { auto: true },
            ...PNPM_STATE_PATTERNS,
            ...TEST_REWRITTEN_PATTERNS.map((pattern) => `!${directory}/${pattern}`),
          ],
          output: [],
        },
        command: "pnpm exec vitest run",
        cwd: directory,
      },
    ]);
