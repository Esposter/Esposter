import { noop, withFinalizer } from "@esposter/shared";

export const ignoreWarn = <TReturn>(callback: () => TReturn) => {
  const warn = console.warn;
  console.warn = noop;
  return withFinalizer(callback, () => {
    console.warn = warn;
  });
};
