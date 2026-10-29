import type { SetupEnvironment } from "#src/models/setup/SetupEnvironment";

import { SetupStatus } from "#src/models/setup/SetupStatus";
import { readWindowsRows } from "#src/services/setup/readWindowsRows";
import { describe, expect, test, vi } from "vitest";

describe(readWindowsRows, () => {
  const createEnvironment = (overrides: Partial<SetupEnvironment>): SetupEnvironment => ({
    exists: () => false,
    makeDirectory: vi.fn(),
    readText: () => undefined,
    run: () => ({ status: 1, stdout: "" }),
    runVisibly: vi.fn(() => ({ status: 0, stdout: null })),
    ...overrides,
  });
  const LONG_PATHS_ON = "LongPathsEnabled    REG_DWORD    0x1\r\n";
  const GENSHIN_PROFILE = JSON.stringify({ areas: ["genshin"], capabilities: ["windows"], id: "pc" });

  test("prints what to do for each Windows fact that is not in place", () => {
    expect.hasAssertions();

    const rows = readWindowsRows(createEnvironment({}), "win32");

    expect(rows.map(({ status, step }) => [step, status])).toStrictEqual([
      ["git symlinks", SetupStatus.NeedsYou],
      ["long paths", SetupStatus.NeedsYou],
      ["AnimeStudio CLI", SetupStatus.NeedsYou],
      ["AnimeStudio Oodle hook", SetupStatus.Info],
      ["fleet SSH key", SetupStatus.NeedsYou],
      ["fleet profile", SetupStatus.NeedsYou],
      ["fleet peers", SetupStatus.NeedsYou],
    ]);
  });

  test("the facts in place are ok, and only the Oodle patch is ever information", () => {
    expect.hasAssertions();

    const environment = createEnvironment({
      exists: () => true,
      readText: () => GENSHIN_PROFILE,
      run: (file) => (file === "reg" ? { status: 0, stdout: LONG_PATHS_ON } : { status: 0, stdout: "true\n" }),
    });

    const rows = readWindowsRows(environment, "win32");

    expect(rows.map(({ status }) => status)).toStrictEqual([
      SetupStatus.Ok,
      SetupStatus.Ok,
      SetupStatus.Ok,
      SetupStatus.Info,
      SetupStatus.Ok,
      SetupStatus.Ok,
      SetupStatus.Ok,
    ]);
  });

  test("reads no Windows row on another platform", () => {
    expect.hasAssertions();

    expect(readWindowsRows(createEnvironment({}), "darwin")).toStrictEqual([]);
  });
});
