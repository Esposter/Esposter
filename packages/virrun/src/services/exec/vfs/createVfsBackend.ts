import type { ExecBackend } from "@/models/exec/ExecBackend";

import { createNativeBackend } from "@/services/exec/native/createNativeBackend";
import { parseNodeInvocation } from "@/services/exec/vfs/parseNodeInvocation";
import { runNodeInProcess } from "@/services/exec/vfs/runNodeInProcess";
// The vfs backend: run recognised pure-JS node invocations in the current process - no child spawn,
// No disk - and fall back to the native backend for everything else. Running in-process is what lets
// The vfs module hooks + fs interception (wired in Step B2) apply; today it covers `node -e` compute.
// Every path it can't run faithfully in-process defers to native, so correctness always matches the
// Baseline; the speed win is real only on the in-process path and is measured against it separately.
export const createVfsBackend = (): ExecBackend => {
  const native = createNativeBackend();
  return {
    exec: (command, options) => {
      const invocation = parseNodeInvocation(command);
      if (!invocation) return native.exec(command, options);
      const result = runNodeInProcess(invocation, options);
      return result ? Promise.resolve(result) : native.exec(command, options);
    },
    name: "vfs",
  };
};
