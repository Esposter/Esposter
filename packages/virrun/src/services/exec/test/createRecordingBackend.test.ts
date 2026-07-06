import type { ExecBackend } from "@/models/exec/ExecBackend";
import type { ExecOptions } from "@/models/exec/ExecOptions";
import type { ExecResult } from "@/models/exec/ExecResult";

import { BackendType } from "@/models/virrun/BackendType";
import { describe } from "vitest";
// Records the options each exec call received and resolves with `result`, standing in for the os backend; `onExec`
// Lets a suite write into the per-call capture upper the way the real command would.
export const createRecordingBackend = (
  result: ExecResult = { exitCode: 0, stderr: "", stdout: "" },
  onExec?: (options: ExecOptions) => void,
): { calls: ExecOptions[]; exec: ExecBackend["exec"]; name: BackendType } => {
  const calls: ExecOptions[] = [];
  return {
    calls,
    exec: (_command, options): Promise<ExecResult> => {
      calls.push(options);
      onExec?.(options);
      return Promise.resolve(result);
    },
    name: BackendType.Os,
  };
};

describe.todo("createRecordingBackend");
