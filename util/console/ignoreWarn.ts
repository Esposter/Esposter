export const ignoreWarn = <TReturn>(fn: () => TReturn) => {
  const warn = console.warn;
  console.warn = () => {};
  const result = fn();
  console.warn = warn;
  return result;
};
