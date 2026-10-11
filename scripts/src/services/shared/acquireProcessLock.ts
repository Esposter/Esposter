import { checkIsProcessRunning } from "#src/services/shared/checkIsProcessRunning";
import { tryCreateLock } from "#src/services/shared/tryCreateLock";
import { getResult } from "@esposter/shared";
import { mkdirSync, readFileSync, rmSync, statSync } from "node:fs";
import { uptime } from "node:os";
import { dirname } from "node:path";

// Takes a lock for this process, or returns False while a live process holds it. A lock whose process is gone was left
// By a holder that died, and one written before the machine last booted names a process id the boot may have handed to
// Another process since, so either is removed and taken once more. An empty lock is one whose holder is still writing it
export const acquireProcessLock = (lockPath: string): boolean => {
  mkdirSync(dirname(lockPath), { recursive: true });
  if (tryCreateLock(lockPath)) return true;
  const holder = getResult(() => readFileSync(lockPath, "utf8")).match(
    (text) => text,
    () => "",
  );
  const bootMilliseconds =
    Temporal.Now.instant().epochMilliseconds -
    Temporal.Duration.from({ seconds: Math.ceil(uptime()) }).total("milliseconds");
  const isFromBeforeBoot = getResult(() => statSync(lockPath).mtimeMs < bootMilliseconds).match(
    (value) => value,
    () => false,
  );
  if (!isFromBeforeBoot && (holder === "" || checkIsProcessRunning(Number(holder)))) return false;
  rmSync(lockPath, { force: true });
  return tryCreateLock(lockPath);
};
