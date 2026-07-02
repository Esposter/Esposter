import type { ExecOptions } from "@/models/exec/ExecOptions";

import { VIRRUN_ENV_KEY } from "@/services/exec/util/constants";
import { withColorEnv } from "@/services/exec/util/withColorEnv";
import { afterEach, describe, expect, test } from "vitest";

const originalIsTTY = Object.getOwnPropertyDescriptor(process.stdout, "isTTY");
const originalGetColorDepth = Object.getOwnPropertyDescriptor(process.stdout, "getColorDepth");
const stubStdout = (isTTY: boolean, colorDepth: number): void => {
  Object.defineProperty(process.stdout, "isTTY", { configurable: true, value: isTTY });
  Object.defineProperty(process.stdout, "getColorDepth", { configurable: true, value: () => colorDepth });
};
const restore = (name: string, descriptor: PropertyDescriptor | undefined): void => {
  if (descriptor) Object.defineProperty(process.stdout, name, descriptor);
  else Reflect.deleteProperty(process.stdout, name);
};
const createOptions = (stdio: ExecOptions["stdio"]): ExecOptions => ({
  cwd: "",
  env: { [VIRRUN_ENV_KEY]: "true" },
  stdio,
});

describe(withColorEnv, () => {
  afterEach(() => {
    restore("isTTY", originalIsTTY);
    restore("getColorDepth", originalGetColorDepth);
  });

  test(`returns the options unchanged for a captured (pipe) run even on a TTY`, () => {
    expect.hasAssertions();

    stubStdout(true, 24);
    const options = createOptions("pipe");

    expect(withColorEnv(options)).toBe(options);
  });

  test(`returns the options unchanged for an inherit run when stdout is not a TTY`, () => {
    expect.hasAssertions();

    stubStdout(false, 24);
    const options = createOptions("inherit");

    expect(withColorEnv(options)).toBe(options);
  });

  test(`forwards FORCE_COLOR at the host color level for a live inherit run on a TTY`, () => {
    expect.hasAssertions();

    stubStdout(true, 24);

    expect(withColorEnv(createOptions("inherit")).env).toStrictEqual({ FORCE_COLOR: "3", [VIRRUN_ENV_KEY]: "true" });
  });

  test(`lets an explicit caller FORCE_COLOR override the forwarded level`, () => {
    expect.hasAssertions();

    stubStdout(true, 24);
    const options: ExecOptions = { cwd: "", env: { FORCE_COLOR: "1" }, stdio: "inherit" };

    expect(withColorEnv(options).env).toStrictEqual({ FORCE_COLOR: "1" });
  });
});
