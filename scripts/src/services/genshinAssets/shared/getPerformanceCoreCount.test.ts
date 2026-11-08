import { getPerformanceCoreCount } from "#src/services/genshinAssets/shared/getPerformanceCoreCount";
import { spawnSync } from "@esposter/shared-node/child-process";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("@esposter/shared-node/child-process"), () => ({
  spawnSync: vi.fn<() => { status: number; stdout: string }>(() => ({
    status: 0,
    stdout: "8",
  })) as unknown as typeof spawnSync,
}));

vi.mock(import("node:os"), async (importOriginal) => ({ ...(await importOriginal()), platform: () => "darwin" }));

describe(getPerformanceCoreCount, () => {
  test("the system's sysctl runs from /usr/sbin on macos", () => {
    expect.hasAssertions();

    getPerformanceCoreCount();

    expect(spawnSync).toHaveBeenCalledExactlyOnceWith("/usr/sbin/sysctl", ["-n", "hw.perflevel0.physicalcpu"], {
      encoding: "utf8",
    });
  });
});
