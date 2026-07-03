import type { ExecBackend } from "@/models/exec/ExecBackend";
import type { FlushOp } from "@/models/exec/FlushOp";

import { BackendType } from "@/models/virrun/BackendType";
import { applyFlushPlan } from "@/services/exec/snapshot/applyFlushPlan";
import { buildHostFlushPlan } from "@/services/exec/snapshot/buildHostFlushPlan";
import { persistRun } from "@/services/exec/snapshot/persistRun";
import { removeSnapshotDirectory } from "@/services/exec/snapshot/removeSnapshotDirectory";
import { resolveSnapshotLocation } from "@/services/exec/snapshot/resolveSnapshotLocation";
import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

// The flush machinery walks real overlay internals via a python seam (Linux-only), so the host-parity assertions live
// In persistRun.equivalence.test. This unit test locks the orchestration contract on any OS: the host flush runs on
// EVERY exit code (native-equivalence — a failed eslint --fix still wrote real files), while the task-cache record
// (onPersist) fires only on a clean exit. An all-or-nothing gate coupling both to one exit-code check flips one of
// These assertions.
vi.mock(import("@/services/exec/snapshot/resolveSnapshotLocation"), () => ({
  resolveSnapshotLocation: vi.fn<typeof resolveSnapshotLocation>(),
}));
vi.mock(import("@/services/exec/snapshot/buildHostFlushPlan"), () => ({
  buildHostFlushPlan: vi.fn<typeof buildHostFlushPlan>(),
}));
vi.mock(import("@/services/exec/snapshot/applyFlushPlan"), () => ({ applyFlushPlan: vi.fn<typeof applyFlushPlan>() }));
vi.mock(import("@/services/exec/snapshot/removeSnapshotDirectory"), () => ({
  removeSnapshotDirectory: vi.fn<typeof removeSnapshotDirectory>(),
}));

describe(persistRun, () => {
  const { cleanup, create } = createTemporaryDirectoryTracker();
  const PLAN: FlushOp[] = [];
  const HOST_DIR = "/host";
  const exec = vi.fn<ExecBackend["exec"]>();
  const backend: ExecBackend = { exec, name: BackendType.Os };
  // Typed to persistRun's own onPersist param so the mock returns void (an untyped vi.fn returns any, which trips
  // Strict-void-return when passed as the `() => void` callback).
  const onPersist = vi.fn<NonNullable<Parameters<typeof persistRun>[5]>>();

  beforeEach(() => {
    vi.clearAllMocks();
    // The snapshot dir must be a real directory — persistRun mkdtempSyncs the per-run upper/work under it.
    vi.mocked(resolveSnapshotLocation).mockReturnValue({ dir: create(), exists: true, hash: "", upperDir: "/snapshot/upper" });
    vi.mocked(buildHostFlushPlan).mockReturnValue(PLAN);
  });

  afterEach(() => {
    cleanup();
  });

  test("flushes the produced files to the host and records the task cache on a clean exit", async () => {
    expect.hasAssertions();

    exec.mockResolvedValue({ exitCode: 0, stderr: "", stdout: "" });

    const result = await persistRun(backend, "oxfmt", { cwd: HOST_DIR, stdio: "pipe" }, [], [], onPersist);

    expect(result.exitCode).toBe(0);
    expect(applyFlushPlan).toHaveBeenCalledExactlyOnceWith(expect.any(String), HOST_DIR, PLAN);
    expect(onPersist).toHaveBeenCalledExactlyOnceWith(expect.any(String), PLAN, { exitCode: 0, stderr: "", stdout: "" });
  });

  test("still flushes on a non-zero exit (native leaves partial output) but never records the task cache", async () => {
    expect.hasAssertions();

    exec.mockResolvedValue({ exitCode: 1, stderr: "", stdout: "" });

    const result = await persistRun(backend, "eslint --fix", { cwd: HOST_DIR, stdio: "pipe" }, [], [], onPersist);

    expect(result.exitCode).toBe(1);
    expect(applyFlushPlan).toHaveBeenCalledExactlyOnceWith(expect.any(String), HOST_DIR, PLAN);
    expect(onPersist).not.toHaveBeenCalled();
  });

  test("always tears down the per-run temp upper and work dirs", async () => {
    expect.hasAssertions();

    exec.mockResolvedValue({ exitCode: 1, stderr: "", stdout: "" });

    await persistRun(backend, "eslint --fix", { cwd: HOST_DIR, stdio: "pipe" });

    expect(removeSnapshotDirectory).toHaveBeenCalledTimes(2);
  });
});
