import { getResult } from "@esposter/shared";
import { execFileSync } from "node:child_process";
import { availableParallelism } from "node:os";

import { SLOT_MAX_COUNT, SLOT_MIN_COUNT } from "#src/services/buildCache/constants";

// The machine's performance cores on macOS, and half its logical processors elsewhere, which is Windows' SMT count
const readPerformanceCoreCount = (): number => {
  const halfLogicalCount = Math.floor(availableParallelism() / 2);
  if (process.platform !== "darwin") return halfLogicalCount;
  return getResult(() =>
    Number(execFileSync("sysctl", ["-n", "hw.perflevel0.physicalcpu"], { encoding: "utf8" })),
  ).match(
    (count) => (Number.isInteger(count) && count > 0 ? count : halfLogicalCount),
    () => halfLogicalCount,
  );
};

// Half the performance cores, clamped to one through four, unless RUN_SLOT_COUNT names a count
export const getSlotCount = (): number => {
  const configuredCount = Number(process.env.RUN_SLOT_COUNT);
  if (Number.isInteger(configuredCount) && configuredCount > 0) return configuredCount;
  return Math.min(Math.max(Math.floor(readPerformanceCoreCount() / 2), SLOT_MIN_COUNT), SLOT_MAX_COUNT);
};
