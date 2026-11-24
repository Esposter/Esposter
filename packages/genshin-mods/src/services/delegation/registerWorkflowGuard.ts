import type { EngineInterface, On } from "claude-code";

import { WORKFLOW_MODEL_REFUSAL } from "../constants";
import { checkIsHaikuOnlyScript } from "./checkIsHaikuOnlyScript";
import { readWorkflowScript } from "./readWorkflowScript";

// A hook that rejects lets its call through: a guard that blocked on its own failure would block every call after it
const letThrough = <E, R>(_$: EngineInterface, e: E, next: (e: E) => R): R => next(e);

export const registerWorkflowGuard = (on: On): void => {
  // A workflow's agents are subagents, so each one must name haiku, as an agent launch does.
  // A saved workflow named with no script, or a script the guard cannot read as code, is refused.
  // Its agents cannot be seen.
  // The rule runs in every session, whichever mods are switched on, since it is not one of them.
  // The engine's registration takes a handler: it runs when the hook rejects, and is not a promise.
  // oxlint-disable-next-line selector-ban/no-restricted-syntax -- a handler, not a promise
  on("tool.call", { tool: ["Workflow"] }, async ($, e, next) => {
    if (checkIsHaikuOnlyScript(await readWorkflowScript($, e))) return next(e);
    return { deny: WORKFLOW_MODEL_REFUSAL };
  }).catch(letThrough);
};
