// Anything callable or constructible, so a class value counts as a function too
export type FunctionLike = ((...args: never) => unknown) | (abstract new (...args: never) => unknown);
