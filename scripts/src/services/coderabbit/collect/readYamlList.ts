import { readYamlBlock } from "#src/services/coderabbit/collect/readYamlBlock";

// The items a YAML key lists, read from the lines it sits among. The collector reads one YAML document, a key at a
// Time, so the grammar is the two forms a list can take: a flow list on the key's line, or a block list of `- item`
// Lines beneath it. A key the lines do not carry lists nothing.
export const readYamlList = (lines: string[], key: string): string[] => {
  const [keyLine, ...itemLines] = readYamlBlock(lines, key);
  if (keyLine === undefined) return [];

  const inlineValue = stripComment(keyLine.trimStart().slice(`${key}:`.length)).trim();
  if (inlineValue.startsWith("["))
    return inlineValue
      .slice(1, -1)
      .split(",")
      .map((item) => getScalar(item))
      .filter(Boolean);
  return itemLines.map((line) => getScalar(stripComment(line).trim().replace(/^-\s*/u, "")));
};

const stripComment = (text: string): string => text.replace(/\s+#.*$/u, "");

const getScalar = (text: string): string => text.trim().replace(/^(?<quote>["'])(?<value>.*)\k<quote>$/u, "$<value>");
