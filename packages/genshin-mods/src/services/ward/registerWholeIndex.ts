import type { EngineInterface, On } from "claude-code";

import { wholeIndex } from "./wholeIndex";

// A hook that rejects lets its call through: a guard that blocked on its own failure would block every call after it
const letThrough = <E, R>(_$: EngineInterface, e: E, next: (e: E) => R): R => next(e);

export const registerWholeIndex = (on: On): void => {
  /* oxlint-disable-next-line selector-ban/no-restricted-syntax -- The engine's registration handler, run when the hook
     rejects, not a promise */
  on("tool.call", { tool: "Bash" }, ($, e, next) => wholeIndex($, e.command, () => next(e))).catch(letThrough);
};
