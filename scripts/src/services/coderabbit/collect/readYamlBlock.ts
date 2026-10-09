// A YAML key's line and the lines beneath it. A block ends at the first content line shallower than its key, or at a
// Sibling key on its key's own indent — a block list may sit at that indent, so a `- item` line there stays in it.
// Comments and blank lines never end one and are dropped. A key the lines do not carry has no block.
export const readYamlBlock = (lines: string[], key: string): string[] => {
  const keyIndex = lines.findIndex((line) => line.trimStart().startsWith(`${key}:`));
  const keyLine = lines[keyIndex];
  if (keyLine === undefined) return [];

  const keyIndent = getIndent(keyLine);
  const blockLines = [keyLine];
  for (const line of lines.slice(keyIndex + 1)) {
    if (line.trim() === "" || line.trim().startsWith("#")) continue;
    const indent = getIndent(line);
    if (indent < keyIndent || (indent === keyIndent && !line.trimStart().startsWith("-"))) break;
    blockLines.push(line);
  }
  return blockLines;
};

const getIndent = (line: string): number => line.length - line.trimStart().length;
