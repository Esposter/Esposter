import { computeEnvironmentKey } from "@/services/exec/snapshot/computeEnvironmentKey";
import { setupTemporaryCacheHome } from "@/services/exec/test/setupTemporaryCacheHome.test";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { describe, expect, test, vi } from "vitest";

const { getSandboxNodeVersion } = vi.hoisted(() => ({
  getSandboxNodeVersion: vi.fn<() => string>(() => "v26.5.0"),
}));

vi.mock(import("@/services/exec/util/getSandboxNodeVersion"), () => ({ getSandboxNodeVersion }));

describe(computeEnvironmentKey, () => {
  const { createWorkspace } = setupTemporaryCacheHome();
  const lockfileContent = "lockfileVersion: '9.0'\n";

  test("is stable for the same lockfile and node", () => {
    expect.hasAssertions();

    getSandboxNodeVersion.mockReturnValue("v26.5.0");

    expect(computeEnvironmentKey(createWorkspace(lockfileContent))).toBe(
      computeEnvironmentKey(createWorkspace(lockfileContent)),
    );
  });

  test("moves when the dependency closure changes", () => {
    expect.hasAssertions();

    getSandboxNodeVersion.mockReturnValue("v26.5.0");

    expect(computeEnvironmentKey(createWorkspace(lockfileContent))).not.toBe(
      computeEnvironmentKey(createWorkspace(`${lockfileContent}  added: true\n`)),
    );
  });

  test("moves when the sandbox node major changes — an installed node_modules is ABI-bound", () => {
    expect.hasAssertions();

    getSandboxNodeVersion.mockReturnValue("v26.5.0");
    const before = computeEnvironmentKey(createWorkspace(lockfileContent));
    getSandboxNodeVersion.mockReturnValue("v27.0.0");

    expect(computeEnvironmentKey(createWorkspace(lockfileContent))).not.toBe(before);
  });

  test("throws when the sandbox node probe comes back empty, so the sweep never runs on a degraded key", () => {
    expect.hasAssertions();

    getSandboxNodeVersion.mockReturnValue("");
    const workspace = createWorkspace(lockfileContent);

    expect(() => computeEnvironmentKey(workspace)).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: ${new InvalidOperationError(Operation.Read, workspace, `sandbox node version is unreadable: ""`).message}]`,
    );
  });

  test("holds across a node minor or patch bump, so a routine upgrade keeps the warm snapshot", () => {
    expect.hasAssertions();

    getSandboxNodeVersion.mockReturnValue("v26.5.0");
    const before = computeEnvironmentKey(createWorkspace(lockfileContent));
    getSandboxNodeVersion.mockReturnValue("v26.9.1");

    expect(computeEnvironmentKey(createWorkspace(lockfileContent))).toBe(before);
  });
});
