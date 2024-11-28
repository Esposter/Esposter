import type { Prettify } from "@/util/types/Prettify";

// Puts space between word boundaries:
// 1. lowercase + uppercase/digit
// 2. digit + lowercase/uppercase
export const prettify = <T extends string>(string: T) =>
  string.replaceAll(/(?<=[a-z])(?=[A-Z0-9])|(?<=[0-9])(?=[a-zA-Z])/g, " ").trim() as Prettify<T>;
