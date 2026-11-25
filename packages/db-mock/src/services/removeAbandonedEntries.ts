import {
  PROCESS_ENTRY_REGEX,
  TEMPLATE_KEY_REGEX,
  TEMPLATE_ROOT,
  TEMPLATE_UNUSED_MILLISECONDS,
} from "#src/services/constants";
import { getResult, noop } from "@esposter/shared";
import { checkIsProcessRunning } from "@esposter/shared-node/check-is-process-running";
import { readdirSync, rmSync, statSync } from "node:fs";
import { join } from "node:path";

// A build or a copy is named by the process that made it, and a process that has exited is one nothing reads, so the
// Next process to make a copy or a build removes it. A file rarely disposes its database, and a worker can end without
// An exit event, so this is what keeps those folders from piling up in the temporary folder
// A template is removed once no run has read it for its age. A worktree on another lockfile may still read a template
// That this checkout's runs no longer use, so the age is the template's last use, which a read renews, and not its key
const isUnusedTemplate = (path: string) => {
  const modifiedMilliseconds = statSync(path, { throwIfNoEntry: false })?.mtimeMs;
  return modifiedMilliseconds !== undefined && Date.now() - modifiedMilliseconds > TEMPLATE_UNUSED_MILLISECONDS;
};

// On Windows a database's files stay locked while the Miniflare process that opened them runs, which can outlive the
// Test process that started it. A locked entry is left for a later run to remove once it unlocks, rather than failing
// The file that happened to make the next copy
const removeEntry = (path: string) => {
  getResult(() => {
    rmSync(path, { force: true, recursive: true });
  }).match(noop, (error) => {
    console.warn(`Kept ${path}, which a later run removes once nothing holds it open`, error);
  });
};

export const removeAbandonedEntries = (): void => {
  for (const entry of readdirSync(TEMPLATE_ROOT)) {
    const path = join(TEMPLATE_ROOT, entry);
    const processId = Number(PROCESS_ENTRY_REGEX.exec(entry)?.groups?.processId);
    if (processId) {
      if (!checkIsProcessRunning(processId)) removeEntry(path);
    } else if (TEMPLATE_KEY_REGEX.test(entry) && isUnusedTemplate(path)) removeEntry(path);
  }
};
