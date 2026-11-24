import { COPY_REGEX, TEMPLATE_ROOT } from "#src/services/constants";
import { checkIsProcessRunning } from "@esposter/shared-node/check-is-process-running";
import { readdirSync, rmSync } from "node:fs";
import { join } from "node:path";

// A copy is named by the process that made it, so a copy whose process has exited is one nothing reads, and the next
// Process to make a copy removes it. A file rarely disposes its database, and a worker can end without an exit event,
// So this is what keeps the copies from piling up in the temporary folder
export const removeAbandonedCopies = () => {
  for (const entry of readdirSync(TEMPLATE_ROOT)) {
    const processId = Number(COPY_REGEX.exec(entry)?.groups?.processId);
    if (!processId || checkIsProcessRunning(processId)) continue;
    rmSync(join(TEMPLATE_ROOT, entry), { force: true, recursive: true });
  }
};
