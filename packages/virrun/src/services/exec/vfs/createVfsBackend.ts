import type { ExecBackend } from "@/models/exec/ExecBackend";

import { BackendType } from "@/models/virrun/BackendType";
import { createNativeBackend } from "@/services/exec/native/createNativeBackend";
import { parseNodeInvocation } from "@/services/exec/vfs/parseNodeInvocation";
import { runNodeInProcess } from "@/services/exec/vfs/runNodeInProcess";
// The vfs backend: run recognised pure-JS node invocations in the current process (no child spawn, no disk) and
// Fall back to native for everything else. Every path it can't run faithfully in-process defers to native, so
// Correctness always matches the baseline; the speed win exists only on the in-process path.
export const createVfsBackend = (): ExecBackend => {
  const native = createNativeBackend();
  return {
    exec: (command, options) => {
      const invocation = parseNodeInvocation(command);
      if (!invocation) return native.exec(command, options);
      const result = runNodeInProcess(invocation, options);
      return result ? Promise.resolve(result) : native.exec(command, options);
    },
    name: BackendType.Vfs,
  };
};
