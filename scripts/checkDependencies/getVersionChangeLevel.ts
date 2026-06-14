import { getVersionParts } from "@/checkDependencies/getVersionParts";

export const getVersionChangeLevel = (current: string, latest: string): number => {
  const currentParts = getVersionParts(current);
  const latestParts = getVersionParts(latest);
  if (currentParts.major !== latestParts.major) return 2;
  if (currentParts.minor !== latestParts.minor) return 1;
  return 0;
};
