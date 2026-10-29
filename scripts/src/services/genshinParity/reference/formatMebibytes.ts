import { MEBIBYTE } from "#src/services/shared/constants";

// A size in mebibytes to one decimal place, as the pack table and the restore line read it
export const formatMebibytes = (bytes: number): string => `${(bytes / MEBIBYTE).toFixed(1)} MB`;
