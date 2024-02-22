import type { PrettifyName } from "@/util/types/PrettifyName";

// Puts space between capital and non-capital letters
export const prettifyName = <T extends string>(string: T) =>
  string.replaceAll(/([A-Z])/g, " $1").trim() as PrettifyName<T>;
