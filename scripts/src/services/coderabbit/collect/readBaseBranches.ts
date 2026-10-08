// The regexes `reviews.auto_review.base_branches` lists, read from the file's own lines. The collector reads one YAML
// document, for this one key, so the grammar is the two forms the file can take: a flow list on the key's line, or a
// block list of `- item` lines beneath it. A key the file does not carry lists nothing.
export const readBaseBranches = (coderabbitYamlText: string): string[] => {
  const lines = coderabbitYamlText.split("\n");
  const autoReviewIndex = lines.findIndex((line) => /^\s*auto_review:\s*(#.*)?$/u.test(line));
  const autoReviewLine = lines[autoReviewIndex];
  if (autoReviewLine === undefined) return [];

  const autoReviewIndent = getIndent(autoReviewLine);
  // A block ends at the first content line that is no deeper than its key; comments and blank lines never end one
  const blockLines: string[] = [];
  for (const line of lines.slice(autoReviewIndex + 1)) {
    if (checkIsIgnored(line)) continue;
    if (getIndent(line) <= autoReviewIndent) break;
    blockLines.push(line);
  }

  const keyIndex = blockLines.findIndex((line) => /^\s*base_branches:/u.test(line));
  const keyLine = blockLines[keyIndex];
  if (keyLine === undefined) return [];

  const keyIndent = getIndent(keyLine);
  const inlineValue = stripComment(keyLine.replace(/^\s*base_branches:/u, "")).trim();
  if (inlineValue.startsWith("[")) return inlineValue.slice(1, -1).split(",").map(getScalar).filter(Boolean);

  const itemLines: string[] = [];
  // A block list may sit at its key's own indent, so only a shallower line or a sibling key ends it
  for (const line of blockLines.slice(keyIndex + 1)) {
    if (checkIsIgnored(line)) continue;
    const isItem = /^\s*-/u.test(line);
    if (getIndent(line) < keyIndent || (getIndent(line) === keyIndent && !isItem)) break;
    itemLines.push(line);
  }
  return itemLines.map((line) => getScalar(stripComment(line).trim().replace(/^-\s*/u, "")));
};

const getIndent = (line: string): number => line.length - line.trimStart().length;

const checkIsIgnored = (line: string): boolean => line.trim() === "" || line.trim().startsWith("#");

const stripComment = (text: string): string => text.replace(/\s+#.*$/u, "");

const getScalar = (text: string): string => text.trim().replace(/^(["'])(.*)\1$/u, "$2");
