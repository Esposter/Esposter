import { QUEST_ID_PATTERN } from "#src/services/genshinProgress/constants";

// A quest a script names is a registry line written as a plain string, `quest <id>`: a bare step, or the line of an expect
// Step. A line that opens as a comment is no step and names nothing. The backtick quote is `\x60`, which a raw template holds
const QUEST_LINE_REGEX = new RegExp(String.raw`(?<quote>["'\x60])${QUEST_ID_PATTERN}\k<quote>`, "gu");
const COMMENT_LINE_REGEX = /^\s*\/\//u;

// The quest ids a script's text names, each once, in the order the script names them
export const parseScriptQuestIds = (text: string): string[] => {
  const code = text
    .split("\n")
    .filter((line) => !COMMENT_LINE_REGEX.test(line))
    .join("\n");
  return [...new Set(Array.from(code.matchAll(QUEST_LINE_REGEX), ({ groups }) => groups?.id ?? ""))];
};
