import type { SelectorBanList } from "#src/models/oxlint/selectorBan/SelectorBanList";

import { readdirSync } from "node:fs";

const SYNTAXES_DIRECTORY = new URL("syntaxes/", import.meta.url);
const SUITE_EXTENSION = ".test.ts";

// Every list is found by its file, so a new one needs no entry anywhere: each module under `syntaxes/` exports one list
// That states its own scope, and its suite beside it is not loaded
export const SELECTOR_BAN_LISTS: SelectorBanList[] = (
  await Promise.all(
    readdirSync(SYNTAXES_DIRECTORY)
      .filter((fileName) => !fileName.endsWith(SUITE_EXTENSION))
      .map(
        async (fileName): Promise<Record<string, SelectorBanList>> =>
          import(new URL(fileName, SYNTAXES_DIRECTORY).href),
      ),
  )
).flatMap((module) => Object.values(module));
