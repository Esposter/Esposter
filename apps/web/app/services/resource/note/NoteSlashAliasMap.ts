// The short words a reader types to find a block, keyed by the block's menu title. A block with no entry is found by its
// Title alone
export const NoteSlashAliasMap: Record<string, string[]> = {
  Blockquote: ["quote"],
  "Bullet List": ["bullet", "ul"],
  "Code Block": ["code"],
  Divider: ["hr", "rule"],
  "Heading 1": ["h1"],
  "Heading 2": ["h2"],
  "Heading 3": ["h3"],
  "Ordered List": ["number", "ol"],
  Paragraph: ["p", "text"],
  "Task List": ["todo"],
};
