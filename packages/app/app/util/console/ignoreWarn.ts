import { noop, withFinalizer } from "@esposter/shared";

export const ignoreWarn = <TReturn>(fn: () => TReturn) => {
  const warn = console.warn;
  console.warn = noop;
  return withFinalizer(fn, () => {
    console.warn = warn;
  });
};
