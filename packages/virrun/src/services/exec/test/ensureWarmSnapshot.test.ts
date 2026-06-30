import type { ExecBackend } from "@/models/exec/ExecBackend";

import { createOsInstallOptions } from "@/services/exec/os/createOsInstallOptions";
import { createSnapshot } from "@/services/exec/snapshot/createSnapshot";
import { resolveSetupCommand } from "@/services/exec/snapshot/resolveSetupCommand";
import { resolveSnapshotLocation } from "@/services/exec/snapshot/resolveSnapshotLocation";
import { describe } from "vitest";
// Captures the warm dependency snapshot for `corpus` once into whatever cache home is active, then reuses it. The
// Three heavy snapshot tests (createSnapshot.acceptance, persistRun/forkSnapshot equivalence) all point at the one
// Shared cache home (resolveAcceptanceCacheHome), so the first to run installs the whole monorepo closure and the
// Rest fork the frozen upper for free — collapsing three full RAM-overlay installs into one. Guarded on `exists`,
// So a re-run with a still-warm cache skips the install entirely. createSnapshot atomically publishes its upper
// (rename is the barrier), so even if two files race past the guard the loser keeps the winner's layer — correct,
// Only a redundant install — which is why no cross-process lock is needed here. A `.test.ts` so ctix keeps it out
// Of the public barrel.
export const ensureWarmSnapshot = async (backend: ExecBackend, corpus: string): Promise<void> => {
  if (resolveSnapshotLocation(corpus).exists) return;
  await createSnapshot(backend, resolveSetupCommand(), createOsInstallOptions(corpus, "pipe"));
};

describe.todo("ensureWarmSnapshot");
