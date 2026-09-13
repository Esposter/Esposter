import type { spawnSync as baseSpawnSync } from "node:child_process";

import { runDrain } from "#src/services/coderabbit/collect/runDrain";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { spawnSync } = vi.hoisted(() => ({ spawnSync: vi.fn<typeof baseSpawnSync>() }));

vi.mock(import("node:child_process"), () => ({ spawnSync: spawnSync as unknown as typeof baseSpawnSync }));

describe(runDrain, () => {
  beforeEach(() => {
    spawnSync.mockReset();
  });

  // A drain that ran is asked to fix findings about this very wording, so its own summary can legitimately
  // Contain the phrase "session limit" — reading that as a refusal to start would report a landed push as limited
  test("does not classify a successful drain's own summary as a session limit", () => {
    expect.hasAssertions();

    spawnSync.mockReturnValue({
      output: [],
      pid: 1,
      signal: null,
      status: 0,
      stderr: "",
      stdout: "Fixed the session limit wording in getDrainLimitResetMs.ts and committed.",
    });

    expect(runDrain("prompt")).toStrictEqual({ isDrained: true, limitResetAtMs: undefined });
  });

  test("classifies a refusal to start as a session limit", () => {
    expect.hasAssertions();

    spawnSync.mockReturnValue({
      output: [],
      pid: 1,
      signal: null,
      status: 1,
      stderr: "",
      stdout: "You've hit your session limit · resets 3:10am (UTC)",
    });

    const drainRun = runDrain("prompt");

    expect(drainRun.isDrained).toBe(false);
    expect(drainRun.limitResetAtMs).toBeDefined();
  });

  // A denylist of two names only ever protects what it already knew to name — this job's own environment grows
  // Secrets over time (`ReviewCollector.yaml`), and every future one would reach the sandbox unless someone
  // Remembered to add it here by hand. Secret-shaped names are withheld instead, whatever they are called,
  // Except the one credential the drain is deliberately given to authenticate `claude` itself
  test("withholds every secret-shaped variable except the one the drain needs to run", () => {
    expect.hasAssertions();

    vi.stubEnv("GH_TOKEN", "gh-token");
    vi.stubEnv("GITHUB_TOKEN", "github-token");
    vi.stubEnv("PULUMI_ACCESS_TOKEN", "pulumi-token");
    vi.stubEnv("AZURE_CLIENT_SECRET", "azure-secret");
    vi.stubEnv("CLAUDE_CODE_OAUTH_TOKEN", "claude-token");
    spawnSync.mockReturnValue({ output: [], pid: 1, signal: null, status: 0, stderr: "", stdout: "" });

    runDrain("prompt");

    const passedEnvironment = spawnSync.mock.calls[0]?.[2]?.env;
    expect(passedEnvironment).toMatchObject({ CLAUDE_CODE_OAUTH_TOKEN: "claude-token", PATH: expect.anything() });
    expect(passedEnvironment).not.toHaveProperty("GH_TOKEN");
    expect(passedEnvironment).not.toHaveProperty("GITHUB_TOKEN");
    expect(passedEnvironment).not.toHaveProperty("PULUMI_ACCESS_TOKEN");
    expect(passedEnvironment).not.toHaveProperty("AZURE_CLIENT_SECRET");
  });
});
