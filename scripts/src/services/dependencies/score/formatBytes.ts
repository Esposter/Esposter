import { KIBIBYTE } from "@esposter/configuration";

// A byte count in the largest binary unit it reaches, one decimal place past the bytes
export const formatBytes = (bytes: number): string => {
  if (bytes < KIBIBYTE) return `${bytes} B`;
  if (bytes < KIBIBYTE ** 2) return `${(bytes / KIBIBYTE).toFixed(1)} KB`;
  return `${(bytes / KIBIBYTE ** 2).toFixed(1)} MB`;
};
