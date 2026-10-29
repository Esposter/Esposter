import { KIBIBYTE } from "@esposter/configuration";

const MEBIBYTE = KIBIBYTE ** 2;

// A size in mebibytes to one decimal place, as the pack table and the restore line read it
export const formatMebibytes = (bytes: number): string => `${(bytes / MEBIBYTE).toFixed(1)} MB`;
