import {
  PROCESS_ENTRY_REGEX,
  TEMPLATE_KEY_REGEX,
  TEMPLATE_ROOT,
  TEMPLATE_UNUSED_MILLISECONDS,
} from "#src/services/constants";
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

export const removeAbandonedEntries = (): void => {
  for (const entry of readdirSync(TEMPLATE_ROOT)) {
    const path = join(TEMPLATE_ROOT, entry);
    const processId = Number(PROCESS_ENTRY_REGEX.exec(entry)?.groups?.processId);
    if (processId) {
      if (!checkIsProcessRunning(processId)) rmSync(path, { force: true, recursive: true });
    } else if (TEMPLATE_KEY_REGEX.test(entry) && isUnusedTemplate(path)) rmSync(path, { force: true, recursive: true });
  }
};
