import { noop } from "@esposter/shared";

export const ignoreWarn = <TReturn>(fn: () => TReturn) => {
  const warn = console.warn;
  console.warn = noop;
  try {
    return fn();
  } finally {
    console.warn = warn;
  }
};
