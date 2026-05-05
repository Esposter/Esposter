import { noop } from "@esposter/shared";

export const ignoreWarn = <TReturn>(fn: () => TReturn) => {
  const warn = console.warn;
  console.warn = noop;
  const result = fn();
  console.warn = warn;
  return result;
};
