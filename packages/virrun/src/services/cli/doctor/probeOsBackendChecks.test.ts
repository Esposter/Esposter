import type { execFileSync as baseExecFileSync } from "node:child_process";

import { DiagnosticCheckType } from "#src/models/cli/DiagnosticCheckType";
import { probeOsBackendChecks } from "#src/services/cli/doctor/probeOsBackendChecks";
import { setupPlatformStub } from "#src/services/exec/test/setupPlatformStub.test";
import { describe, expect, test, vi } from "vitest";

const { execFileSync } = vi.hoisted(() => ({ execFileSync: vi.fn<typeof baseExecFileSync>() }));

vi.mock(import("node:child_process"), () => ({ execFileSync: execFileSync as unknown as typeof baseExecFileSync }));

describe(probeOsBackendChecks, () => {
  const stubPlatform = setupPlatformStub();

  // Every probe past WSL runs inside the guest, so a VM that will not start would otherwise read as each of their
  // Tools missing — the report names the dead VM and keeps only the host-side tar beside it
  test("stops at a WSL that does not start, keeping only the host-side check", () => {
    expect.hasAssertions();

    stubPlatform("win32");
    execFileSync.mockImplementation(() => {
      throw new Error(" ");
    });

    expect(probeOsBackendChecks().map(({ type }) => type)).toStrictEqual([
      DiagnosticCheckType.Wsl,
      DiagnosticCheckType.Tar,
    ]);
  });
});
