import { MEBIBYTE } from "#src/services/shared/constants";
import { KIBIBYTE } from "@esposter/configuration";

// A byte count in the largest binary unit it reaches, one decimal place past the bytes
export const formatBytes = (bytes: number): string => {
  if (bytes < KIBIBYTE) return `${bytes} B`;
  if (bytes < MEBIBYTE) return `${(bytes / KIBIBYTE).toFixed(1)} KB`;
  return `${(bytes / MEBIBYTE).toFixed(1)} MB`;
};
