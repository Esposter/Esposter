import type { EngineInterface } from "claude-code";

import { getParentFolder } from "./getParentFolder";

// The nearest folder at or above `folder` holding a `.git`, a worktree's file included, undefined when none does
// A declaration, not an arrow: the hooks module's bundle
// oxlint-disable-next-line func-style -- follows an imported helper that takes `$` only into a function declaration
export async function findCheckoutRoot($: EngineInterface, folder: string): Promise<string | undefined> {
  let current: string | undefined = folder;
  while (current !== undefined) {
    // Checkout, and the walk ends there
    // oxlint-disable-next-line no-await-in-loop -- Stop at the first: the nearest folder holding a `.git` is the
    if (await $.fs.exists(`${current}/.git`)) return current;
    current = getParentFolder(current);
  }
  return undefined;
}
