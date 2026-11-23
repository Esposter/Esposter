import type { EngineInterface, On } from "claude-code";

import { ward } from "./ward";

// A hook that rejects lets its call through: a guard that blocked on its own failure would block every call after it
const letThrough = <E, R>(_$: EngineInterface, e: E, next: (e: E) => R): R => next(e);

// The question dismissed or the record unreadable alike lets the edit through, since Cancel is the person's way to stop
// One
export const registerWard = (on: On): void => {
  /* oxlint-disable selector-ban/no-restricted-syntax -- The engine's registration handler, run when the hook
     rejects, not a promise */
  on("tool.call", { tool: "Edit" }, ($, e, next) => ward($, e.file_path, () => next(e))).catch(letThrough);
  on("tool.call", { tool: "Write" }, ($, e, next) => ward($, e.file_path, () => next(e))).catch(letThrough);
  on("tool.call", { tool: "NotebookEdit" }, ($, e, next) => ward($, e.notebook_path, () => next(e))).catch(letThrough);
  /* oxlint-enable selector-ban/no-restricted-syntax */
};
