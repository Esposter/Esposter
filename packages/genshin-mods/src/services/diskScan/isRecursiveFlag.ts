import { isRecursiveLongFlag } from "./isRecursiveLongFlag";

export const isRecursiveFlag = (token: string, shortFlagRegex: RegExp) =>
  shortFlagRegex.test(token) || isRecursiveLongFlag(token);
