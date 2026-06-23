import type { BackendType } from "@/models/sandbox/BackendType";

export interface SandboxOptions {
  backend: BackendType;
  // Working directory commands run in. Empty string means the current process cwd.
  cwd: string;
}
