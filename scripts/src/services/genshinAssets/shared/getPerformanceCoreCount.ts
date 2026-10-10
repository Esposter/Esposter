import { spawnSync } from "node:child_process";
import { availableParallelism, platform } from "node:os";

// The performance cores of an Apple silicon Mac, which a map's shards are sized to. Elsewhere there is no such count to
// Read, so half the logical processors stand in for the physical cores, each of which runs two
export const getPerformanceCoreCount = (): number => {
  if (platform() === "darwin") {
    const { status, stdout } = spawnSync("sysctl", ["-n", "hw.perflevel0.physicalcpu"], { encoding: "utf8" });
    const count = Number(stdout);
    if (status === 0 && Number.isInteger(count) && count > 0) return count;
  }
  return Math.max(1, Math.floor(availableParallelism() / 2));
};
