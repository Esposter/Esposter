import { checkIsRecursiveLongFlag } from "./checkIsRecursiveLongFlag";

export const checkIsRecursiveFlag = (token: string, shortFlagRegex: RegExp): boolean =>
  shortFlagRegex.test(token) || checkIsRecursiveLongFlag(token);
