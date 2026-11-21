import type { EngineInterface, On } from "claude-code";

import { WORKFLOW_MODEL_REFUSAL } from "../constants";
import { checkIsHaikuOnlyScript } from "./checkIsHaikuOnlyScript";
import { readWorkflowScript } from "./readWorkflowScript";

// Any failure lets the launch through, as the ward's does: a gate that blocked on its own failure would block every
// Launch after it. `next` is replay-safe here, so a launch the hook had already decided is not run twice
const letLaunchThrough = <E, R>(_$: EngineInterface, e: E, next: (e: E) => R): R => next(e);

export const registerWorkflowGuard = (on: On): void => {
  // A workflow's agents are subagents, so each one must name haiku, as an agent launch does. A saved workflow named with
  // No script, or a script that cannot be read as code, has agents the check cannot see, so it is refused. The rule runs
  // In every session, whichever mods are switched on, since it is not one of them
  // eslint-disable-next-line no-restricted-syntax -- The engine's registration handler, run when the hook rejects, not a promise
  on("tool.call", { tool: ["Workflow"] }, async ($, e, next) => {
    if (checkIsHaikuOnlyScript(await readWorkflowScript($, e))) return next(e);
    return { deny: WORKFLOW_MODEL_REFUSAL };
  }).catch(letLaunchThrough);
};
