import type { ChildProcess } from "node:child_process";

import { getResult, noop } from "@esposter/shared";
import { spawnSync } from "@esposter/shared-node/child-process";

// The whole process tree the launch started, not `pnpm` alone: a session it launched can outlive `pnpm`, holding stdout open
export const killTree = (child: ChildProcess): void => {
  console.info("the session passed its deadline, so its process tree is killed");
  const { pid } = child;
  if (pid === undefined) return;
  if (process.platform === "win32") {
    spawnSync("taskkill", ["/PID", String(pid), "/T", "/F"], { stdio: "ignore" });
    return;
  }
  // The group's id is its leader's pid, negated to name the group rather than the process
  getResult(() => process.kill(-pid, "SIGKILL")).match(noop, (error) => {
    if (!("code" in error) || error.code !== "ESRCH") console.error(error);
  });
};
