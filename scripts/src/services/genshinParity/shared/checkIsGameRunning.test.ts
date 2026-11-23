import type { execFileSync } from "@esposter/shared-node/child-process";

import { checkIsGameRunning } from "#src/services/genshinParity/shared/checkIsGameRunning";
import { GAME_EXECUTABLE_NAME } from "#src/services/genshinParity/shared/constants";
import { describe, expect, test, vi } from "vitest";

const { mockedExecFileSync } = vi.hoisted(() => ({
  mockedExecFileSync: vi.fn<(file: string, args: string[], options: { encoding: "utf8" }) => string>(),
}));

// The shared wrapper is typed as node's overloaded function, which a single signature cannot satisfy, so the mock is
// Cast Through unknown as the other suites that mock it are
vi.mock(import("@esposter/shared-node/child-process"), () => ({
  execFileSync: mockedExecFileSync as unknown as typeof execFileSync,
}));

describe(checkIsGameRunning, () => {
  test("a block run refuses while the game is running on macos", () => {
    expect.hasAssertions();

    mockedExecFileSync.mockReturnValue(`/Applications/Wine/${GAME_EXECUTABLE_NAME}\n`);

    expect(checkIsGameRunning("darwin")).toBe(true);
    expect(mockedExecFileSync).toHaveBeenCalledExactlyOnceWith("/bin/ps", ["-axo", "comm="], { encoding: "utf8" });
  });

  test("a block run proceeds when the game is not running on macos", () => {
    expect.hasAssertions();

    mockedExecFileSync.mockReturnValue("/usr/sbin/cfprefsd\n");

    expect(checkIsGameRunning("darwin")).toBe(false);
  });
});
