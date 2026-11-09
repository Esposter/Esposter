import { checkIsHaikuOptions } from "./checkIsHaikuOptions";
import { findClosingBracket } from "./findClosingBracket";
import { findNonSpace } from "./findNonSpace";
import { findTopLevelComma } from "./findTopLevelComma";
import { maskScriptCode } from "./maskScriptCode";

// Names a script can reach an agent, or a run of other code, through without spelling `agent(` in its code: a saved
// Workflow, code evaluated from a string, a constructor reached through a value, and the objects a name is looked up on
const HIDDEN_CALL_REGEX =
  /(?<![\w$])(?:Function|Reflect|constructor|eval|globalThis|import|process|require|self|this|window|workflow)(?![\w$])/u;
const AGENT_CALL_REGEX = /(?<![\w$])agent\s*\(/gu;
const AGENT_NAME_REGEX = /(?<![\w$])agent(?![\w$])/gu;

// Whether the agent call whose argument list opens at openIndex passes its options on the haiku model, as a second
// argument that is an object literal and nothing else
const checkIsHaikuCall = (script: string, code: string, openIndex: number): boolean => {
  const closeIndex = findClosingBracket(code, openIndex);
  if (closeIndex === -1) return false;
  const comma = findTopLevelComma(code, openIndex + 1, closeIndex);
  if (comma === -1) return false;
  const optionsOpen = findNonSpace(code, comma + 1, closeIndex);
  if (code.charAt(optionsOpen) !== "{") return false;
  const optionsClose = findClosingBracket(code, optionsOpen);
  if (optionsClose === -1 || optionsClose > closeIndex) return false;
  const afterOptions = findNonSpace(code, optionsClose + 1, closeIndex);
  if (afterOptions !== closeIndex && code.charAt(afterOptions) !== ",") return false;
  return checkIsHaikuOptions(script, code, optionsOpen, optionsClose);
};

// Whether a script provably launches every agent on haiku: each `agent(` call in its code passes the haiku model in its
// options, and there is at least one. A script that is absent, cannot be read as code, or names a workflow it does not
// hold is refused, since its agents cannot be seen
export const checkIsHaikuOnlyScript = (script: string | undefined): boolean => {
  if (script === undefined) return false;
  const code = maskScriptCode(script);
  if (code === undefined || HIDDEN_CALL_REGEX.test(code)) return false;
  const calls = [...code.matchAll(AGENT_CALL_REGEX)];
  const names = [...code.matchAll(AGENT_NAME_REGEX)];
  return (
    calls.length > 0 &&
    calls.length === names.length &&
    calls.every((call) => checkIsHaikuCall(script, code, call.index + call[0].length - 1))
  );
};
