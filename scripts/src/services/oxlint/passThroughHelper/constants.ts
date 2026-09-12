export const MESSAGE =
  "Forwarding wrapper: every argument is still hand-written at the call site, so this only renames the callee. Inline it, or give it something to absorb — a constant, a narrowing, or a definition several call sites must agree on.";

// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this regex would otherwise infer
export const UPPER_SNAKE_REGEX: RegExp = /^[A-Z0-9_]+$/u;
