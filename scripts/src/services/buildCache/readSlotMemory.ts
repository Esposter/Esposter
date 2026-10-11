import { getResult } from "@esposter/shared";
import { execFileSync } from "node:child_process";
import { freemem, totalmem } from "node:os";

// On macOS the free pages alone read as used memory, so there the free share is the kernel's pressure level
const MEMORY_PRESSURE_LEVEL_FALLBACK = 100;

export const readSlotMemory = (): { freeMemory: number; totalMemory: number } => {
  const totalMemory = totalmem();
  if (process.platform !== "darwin") return { freeMemory: freemem(), totalMemory };
  const level = getResult(() =>
    Number(execFileSync("sysctl", ["-n", "kern.memorystatus_level"], { encoding: "utf8" })),
  ).match(
    (value) => value,
    () => MEMORY_PRESSURE_LEVEL_FALLBACK,
  );
  return { freeMemory: (totalMemory * level) / 100, totalMemory };
};
