import type { EngineInterface, On } from "claude-code";

import { atom, update } from "claude-code";

import type { DelegationCall } from "../../models/DelegationCall";

import { DelegationStep } from "../../models/DelegationStep";
import { InitialState } from "../InitialState";
import { getCallStep } from "./getCallStep";
import { getNextStreak } from "./getNextStreak";
import { getNudge } from "./getNudge";

const lookupStreakAtom = atom({ key: "lookupStreak", plugin: "genshin-mods" } as const, InitialState.lookupStreak);

// The count is one update, so calls the model sends in one batch each see the count the call before them left. The
// Nudge is the count's, and a neutral call earns none
const countCall = async ($: EngineInterface, call: DelegationCall): Promise<string | undefined> => {
  const step = getCallStep(call);
  if (step === DelegationStep.Neutral) return undefined;
  const streak = await update($, lookupStreakAtom, (value) => getNextStreak(value, step));
  return step === DelegationStep.Lookup ? getNudge(streak) : undefined;
};

// Any failure lets the call through, as the ward's does: a count that blocked on its own failure would block every
// Call after it. `next` is replay-safe here, so a call the hook had already counted is not run twice
const letCallThrough = <E, R>(_$: EngineInterface, e: E, next: (e: E) => R): R => next(e);

export const registerDelegation = (on: On): void => {
  // A nudge rides on the call's own result as context the model reads after it, and never blocks the call
  // eslint-disable-next-line no-restricted-syntax -- The engine's registration handler, run when the hook rejects, not a promise
  on(
    "tool.call",
    { tool: ["Agent", "Bash", "Edit", "Glob", "Grep", "NotebookEdit", "PowerShell", "Read", "WebFetch", "Write"] },
    async ($, e, next) => {
      const nudge = await countCall($, e);
      const result = await next(e);
      return nudge !== undefined && result.deny === undefined
        ? { ...result, context: [...(result.context ?? []), nudge] }
        : result;
    },
  ).catch(letCallThrough);
};
