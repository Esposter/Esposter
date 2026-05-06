import { noop, withFinalizer } from "@esposter/shared";

export const ignoreWarn = (fn: () => unknown) => {
  const warn = console.warn;
  console.warn = noop;
  return withFinalizer(fn, () => {
    console.warn = warn;
  });
};
