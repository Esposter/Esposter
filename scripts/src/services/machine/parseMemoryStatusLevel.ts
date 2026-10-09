import { InvalidOperationError, Operation } from "@esposter/shared";

const PERCENTAGE = 100;
const LEVEL_REGEX = /^(?<level>\d+)$/u;

// The share of memory macOS counts as available, from `sysctl -n kern.memorystatus_level`, which prints one whole percentage
export const parseMemoryStatusLevel = (output: string): number => {
  const levelMatch = LEVEL_REGEX.exec(output.trim());
  const level = Number(levelMatch?.groups?.level);
  if (!levelMatch || level > PERCENTAGE)
    throw new InvalidOperationError(Operation.Read, "sysctl", "reports no memory status level");
  return level / PERCENTAGE;
};
