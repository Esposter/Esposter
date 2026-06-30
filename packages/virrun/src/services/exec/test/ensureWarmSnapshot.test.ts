import type { ExecBackend } from "@/models/exec/ExecBackend";

import { createOsInstallOptions } from "@/services/exec/os/createOsInstallOptions";
import { createSnapshot } from "@/services/exec/snapshot/createSnapshot";
import { resolveSetupCommand } from "@/services/exec/snapshot/resolveSetupCommand";
import { resolveSnapshotLocation } from "@/services/exec/snapshot/resolveSnapshotLocation";
import { describe } from "vitest";
// Captures the warm snapshot for `corpus` once, then reuses it: the heavy snapshot tests share one cache home, so
// The first to run installs the closure and the rest fork the frozen upper for free. Guarded on `exists`, so a
// Warm cache skips the install. createSnapshot atomically publishes its upper, so two files racing past the guard
// Stay correct (the loser keeps the winner's layer) — only a redundant install, hence no cross-process lock.
export const ensureWarmSnapshot = async (backend: ExecBackend, corpus: string): Promise<void> => {
  if (resolveSnapshotLocation(corpus).exists) return;
  await createSnapshot(backend, resolveSetupCommand(), createOsInstallOptions(corpus, "pipe"));
};

describe.todo("ensureWarmSnapshot");
