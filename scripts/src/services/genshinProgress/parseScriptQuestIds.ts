// A quest a script names is a registry line written as a plain string, `quest <id>`: a bare step, or the line of an expect
// Step. A line that opens as a comment is no step and names nothing
const QUEST_LINE_REGEX = /(["'`])quest (?<id>\d+)\1/gu;
const COMMENT_LINE_REGEX = /^\s*\/\//u;

// The quest ids a script's text names, each once, in the order the script names them
export const parseScriptQuestIds = (text: string): string[] => {
  const code = text
    .split("\n")
    .filter((line) => !COMMENT_LINE_REGEX.test(line))
    .join("\n");
  return [...new Set(Array.from(code.matchAll(QUEST_LINE_REGEX), ({ groups }) => groups?.id ?? ""))];
};
