import type { EngineInterface } from "claude-code";

// The nearest folder at or above `folder` holding a `.git`, a worktree's file included, undefined when none does
const findCheckoutRoot = async ($: EngineInterface, folder: string): Promise<string | undefined> => {
  if (await $.fs.exists(`${folder}/.git`)) return folder;
  const parent = folder.replace(/[/\\][^/\\]*$/u, "");
  return parent === folder || parent === "" ? undefined : findCheckoutRoot($, parent);
};

// The checkout a session's git commands run in: the folder with the `.git`, or the session's own folder where none is
export const getCheckoutRoot = async ($: EngineInterface, cwd: string): Promise<string> =>
  (await findCheckoutRoot($, cwd)) ?? cwd;
