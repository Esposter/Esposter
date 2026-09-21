import { getResult } from "@esposter/shared";
// Overlay temps and cache leases are tagged with the creating process's pid; a live owner means the entry is still in
// Use and must survive a concurrent run's sweep, while a dead owner is a hard-kill corpse to reclaim. process.kill(pid,
// 0) sends no signal — it only probes existence: success (or EPERM, alive but owned by another user) => alive; ESRCH
// (no such process) => dead. A non-positive pid has special process-group semantics and is never a real owner, so it
// Reads as dead.
export const checkIsProcessAlive = (pid: number): boolean => {
  if (pid <= 0) return false;
  return getResult(() => {
    process.kill(pid, 0);
  }).match(
    () => true,
    (error) => "code" in error && error.code === "EPERM",
  );
};
