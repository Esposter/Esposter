import { computeEnvironmentKey } from "#src/services/exec/snapshot/computeEnvironmentKey";
import { setupTemporaryCacheHome } from "#src/services/exec/test/setupTemporaryCacheHome.test";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { describe, expect, test, vi } from "vitest";

const { getSandboxNodeVersion } = vi.hoisted(() => ({
  getSandboxNodeVersion: vi.fn<() => string>(() => "v0.0.0"),
}));

vi.mock(import("#src/services/exec/util/getSandboxNodeVersion"), () => ({ getSandboxNodeVersion }));

describe(computeEnvironmentKey, () => {
  const { createWorkspace } = setupTemporaryCacheHome();
  const lockfileContent = "";
  const nodeVersion = "v0.0.0";

  test("is stable for the same lockfile and node", () => {
    expect.hasAssertions();

    getSandboxNodeVersion.mockReturnValue(nodeVersion);

    expect(computeEnvironmentKey(createWorkspace(lockfileContent))).toBe(
      computeEnvironmentKey(createWorkspace(lockfileContent)),
    );
  });

  test("moves when the dependency closure changes", () => {
    expect.hasAssertions();

    getSandboxNodeVersion.mockReturnValue(nodeVersion);

    expect(computeEnvironmentKey(createWorkspace(lockfileContent))).not.toBe(
      computeEnvironmentKey(createWorkspace(" ")),
    );
  });

  test("moves when the sandbox node major changes — an installed node_modules is ABI-bound", () => {
    expect.hasAssertions();

    getSandboxNodeVersion.mockReturnValue(nodeVersion);
    const beforeKey = computeEnvironmentKey(createWorkspace(lockfileContent));
    getSandboxNodeVersion.mockReturnValue("v1.0.0");

    expect(computeEnvironmentKey(createWorkspace(lockfileContent))).not.toBe(beforeKey);
  });

  test("throws when the sandbox node probe comes back empty, so the sweep never runs on a degraded key", () => {
    expect.hasAssertions();

    getSandboxNodeVersion.mockReturnValue("");
    const workspace = createWorkspace(lockfileContent);

    expect(() => computeEnvironmentKey(workspace)).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: ${
        new InvalidOperationError(
          Operation.Read,
          computeEnvironmentKey.name,
          `sandbox node version is unreadable: "" for ${workspace}. On win32 this is the node a WSL login shell puts on PATH — check that one does.`,
        ).message
      }]`,
    );
  });

  test("holds across a node minor or patch bump, so a routine upgrade keeps the warm snapshot", () => {
    expect.hasAssertions();

    getSandboxNodeVersion.mockReturnValue(nodeVersion);
    const beforeKey = computeEnvironmentKey(createWorkspace(lockfileContent));
    getSandboxNodeVersion.mockReturnValue("v0.1.1");

    expect(computeEnvironmentKey(createWorkspace(lockfileContent))).toBe(beforeKey);
  });
});
