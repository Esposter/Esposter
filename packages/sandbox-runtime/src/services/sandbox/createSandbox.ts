import type { ExecBackend } from "@/models/exec/ExecBackend";
import type { Sandbox } from "@/models/sandbox/Sandbox";
import type { SandboxOptions } from "@/models/sandbox/SandboxOptions";
import { BackendType } from "@/models/sandbox/BackendType";
import { createNativeBackend } from "@/services/exec/createNativeBackend";
// Maps each backend choice to its factory. Adding the future `vfs`/`os` backends is a one-line
// entry here — nothing else in the orchestrator changes. "auto" resolves to native until they exist.
const backendFactories: Record<BackendType, () => ExecBackend> = {
  [BackendType.Auto]: createNativeBackend,
  [BackendType.Native]: createNativeBackend,
};
// The orchestrator entrypoint. Resolves a backend and hands back a tiny handle whose exec routes
// every command through it. Today that backend is native passthrough, so the sandbox is a no-op
// wrapper — but it is the seam dogfooding and the gate harnesses are built against from day one.
export const createSandbox = (options: Partial<SandboxOptions> = {}): Sandbox => {
  const { backend = BackendType.Auto, cwd = "" } = options;
  const execBackend = backendFactories[backend]();
  return {
    backend: execBackend.name,
    exec: (command, stdio = "pipe") => execBackend.exec(command, { cwd, stdio }),
  };
};
