import type { ExecOptions } from "#src/models/exec/ExecOptions";

import { createOsInstallOptions } from "#src/services/exec/os/createOsInstallOptions";
import { CI_ENV_KEY, CI_ENV_VALUE } from "#src/services/exec/util/constants";
import { describe, expect, test, vi } from "vitest";

// The sandbox options it extends are `createOsExecOptions`' contract and its own suite's
const { execOptions } = vi.hoisted(() => ({
  execOptions: {
    bindDirectories: ["bindDirectories"],
    cwd: "cwd",
    env: { env: "env" },
    stdio: "pipe",
  } satisfies ExecOptions,
}));

vi.mock(import("#src/services/exec/os/createOsExecOptions"), () => ({ createOsExecOptions: () => execOptions }));

describe(createOsInstallOptions, () => {
  test("adds CI to the sandbox options so pnpm purges the leaked host node_modules instead of prompting for a TTY", () => {
    expect.hasAssertions();

    expect(createOsInstallOptions("", "pipe")).toStrictEqual({
      ...execOptions,
      env: { ...execOptions.env, [CI_ENV_KEY]: CI_ENV_VALUE },
    });
  });
});
