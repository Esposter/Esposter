import { getVersionParts } from "@/checkDependencies/getVersionParts";

export const compareVersionBase = (left: string, right: string): number => {
  const leftParts = getVersionParts(left);
  const rightParts = getVersionParts(right);

  for (const key of ["major", "minor", "patch"] as const) {
    const difference = leftParts[key] - rightParts[key];
    if (difference !== 0) return difference;
  }

  return 0;
};
