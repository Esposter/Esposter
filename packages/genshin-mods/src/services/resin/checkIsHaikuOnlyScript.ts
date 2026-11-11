import { checkIsHaikuOptions } from "./checkIsHaikuOptions";
import { findClosingBracket } from "./findClosingBracket";
import { findNonSpace } from "./findNonSpace";
import { findTopLevelComma } from "./findTopLevelComma";
import { maskScriptCode } from "./maskScriptCode";

// Names a script can reach an agent, or a run of other code, through without spelling `agent(` in its code: a saved
// Workflow, code evaluated from a string, a constructor reached through a value, and the objects a name is looked up on
const HIDDEN_NAMES = [
  "Function",
  "Reflect",
  "constructor",
  "eval",
  "global",
  "globalThis",
  "import",
  "process",
  "require",
  "self",
  "this",
  "window",
  "workflow",
];
const HIDDEN_CALL_REGEX = new RegExp(String.raw`(?<![\w$])(?:${HIDDEN_NAMES.join("|")})(?![\w$])`, "u");
// A name written as a quoted property, which the mask blanks with the rest of the string: `hub['agent']` reaches the agent
// And `({})['constructor']` reaches the constructor, neither spelling `agent(` nor the name in code
const QUOTED_ACCESS_REGEX = new RegExp(String.raw`\[\s*(['"${"`"}])(?:agent|${HIDDEN_NAMES.join("|")})\1\s*\]`, "u");
const AGENT_CALL_REGEX = /(?<![\w$])agent\s*\(/gu;
const AGENT_NAME_REGEX = /(?<![\w$])agent(?![\w$])/gu;

// Whether a script provably launches every agent on haiku: each `agent(` call in its code passes the haiku model in its
// Options, and there is at least one. A script that is absent, cannot be read as code, or names a workflow it does not
// Hold is refused, since its agents cannot be seen
export const checkIsHaikuOnlyScript = (script: string | undefined): boolean => {
  if (script === undefined) return false;
  const code = maskScriptCode(script);
  if (code === undefined || HIDDEN_CALL_REGEX.test(code) || QUOTED_ACCESS_REGEX.test(script)) return false;
  const calls = [...code.matchAll(AGENT_CALL_REGEX)];
  const names = [...code.matchAll(AGENT_NAME_REGEX)];
  // The second argument of each call is the options, an object literal and nothing else after it in the call
  return (
    calls.length > 0 &&
    calls.length === names.length &&
    calls.every((call) => {
      const openIndex = call.index + call[0].length - 1;
      const closeIndex = findClosingBracket(code, openIndex);
      if (closeIndex === -1) return false;
      const comma = findTopLevelComma(code, openIndex + 1, closeIndex);
      if (comma === -1) return false;
      const optionsOpen = findNonSpace(code, comma + 1, closeIndex);
      if (code.charAt(optionsOpen) !== "{") return false;
      const optionsClose = findClosingBracket(code, optionsOpen);
      if (optionsClose === -1 || optionsClose > closeIndex) return false;
      const afterOptions = findNonSpace(code, optionsClose + 1, closeIndex);
      if (afterOptions !== closeIndex) {
        if (code.charAt(afterOptions) !== ",") return false;
        if (findNonSpace(code, afterOptions + 1, closeIndex) !== closeIndex) return false;
      }
      return checkIsHaikuOptions(script, code, optionsOpen, optionsClose);
    })
  );
};
