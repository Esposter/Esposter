import type { execFileSync as baseExecFileSync } from "node:child_process";

import { readWslPath } from "@/services/exec/readWslPath";
import { describe, expect, test, vi } from "vitest";

const { execFileSync } = vi.hoisted(() => ({
  execFileSync: vi.fn<typeof baseExecFileSync>(((_file, args) =>
    Array.isArray(args) ? `/wsl/${args.at(-1) ?? ""}\n` : "") as typeof baseExecFileSync),
}));

vi.mock(import("node:child_process"), () => ({
  execFileSync: execFileSync as unknown as typeof baseExecFileSync,
}));

describe(readWslPath, () => {
  test("memoizes translated paths", () => {
    expect.hasAssertions();

    expect(readWslPath("C:\\repo")).toBe("/wsl/C:\\repo");
    expect(readWslPath("C:\\repo")).toBe("/wsl/C:\\repo");
    expect(execFileSync).toHaveBeenCalledTimes(1);
  });
});
