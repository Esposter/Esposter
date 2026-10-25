import type { JSONContent } from "@tiptap/core";

type MarkWrapper = (text: string, mark: JSONContent) => string;

// Innermost first, so a bold link reads as a link around bold text, and a link is what a reader sees at the edge
const MARK_WRAPPERS: { type: string; wrap: MarkWrapper }[] = [
  { type: "bold", wrap: (text) => `**${text}**` },
  { type: "italic", wrap: (text) => `*${text}*` },
  { type: "strike", wrap: (text) => `~~${text}~~` },
  { type: "link", wrap: (text, mark) => `[${text}](${formatDestination(String(mark.attrs?.href ?? ""))})` },
];
const SPECIAL_CHARACTER_REGEX = /[\\`*_[\]<>~&!]/gu;
// The marker's own character is escaped (`1\.`, `\#`), so the line reads as its text
const LINE_START_MARKER_REGEX = /^([ \t]*\d*)([#>+\-.)])(?=\s|$)/gm;
const BACKTICK_RUN_REGEX = /`+/g;
const BACKTICK_EDGE_REGEX = /^`|`$/;

const longestBacktickRun = (text: string) =>
  Math.max(0, ...[...text.matchAll(BACKTICK_RUN_REGEX)].map(([run]) => run.length));

const escapeText = (text: string) => text.replaceAll(SPECIAL_CHARACTER_REGEX, (character) => `\\${character}`);

// A code span is fenced by a run of backticks longer than any the text holds, padded when the text starts or ends with one
const formatCodeSpan = (text: string) => {
  const fence = "`".repeat(longestBacktickRun(text) + 1);
  return BACKTICK_EDGE_REGEX.test(text) ? `${fence} ${text} ${fence}` : `${fence}${text}${fence}`;
};

// A destination with a space or a bracket in it is wrapped in angle brackets, which CommonMark reads as one destination
const formatDestination = (href: string) => (/[\s()<>]/.test(href) ? `<${href}>` : href);

// A paragraph line that begins with a block marker reads back as that block, so the marker is escaped
const escapeLineStarts = (text: string) => text.replaceAll(LINE_START_MARKER_REGEX, "$1\\$2");

// Blank lines take the continuation prefix without its trailing space, so a quote stays one quote across its paragraphs
const prefixLines = (body: string, firstPrefix: string, restPrefix: string) =>
  body
    .split("\n")
    .map((line, index) => {
      const prefix = index === 0 ? firstPrefix : restPrefix;
      return line === "" ? prefix.trimEnd() : `${prefix}${line}`;
    })
    .join("\n");

const serializeInlineNode = (node: JSONContent): string => {
  if (node.type === "hardBreak") return "\\\n";

  if (node.type !== "text") return serializeInline(node.content ?? []);

  const marks = node.marks ?? [];
  const isCode = marks.some(({ type }) => type === "code");
  const text = isCode ? formatCodeSpan(node.text ?? "") : escapeText(node.text ?? "");
  return MARK_WRAPPERS.reduce((wrapped, { type, wrap }) => {
    const mark = marks.find((candidate) => candidate.type === type);
    return mark ? wrap(wrapped, mark) : wrapped;
  }, text);
};

const serializeInline = (nodes: JSONContent[]): string => nodes.map(serializeInlineNode).join("");

const serializeParagraph = (node: JSONContent) => escapeLineStarts(serializeInline(node.content ?? []));

const serializeListItems = (items: JSONContent[], getMarker: (item: JSONContent, index: number) => string) =>
  items
    .map((item, index) => {
      const marker = getMarker(item, index);
      return prefixLines(serializeBlocks(item.content ?? []), marker, " ".repeat(marker.length));
    })
    .join("\n");

const serializeCodeBlock = (node: JSONContent) => {
  const text = (node.content ?? []).map(({ text: content }) => content ?? "").join("");
  const fence = "`".repeat(Math.max(3, longestBacktickRun(text) + 1));
  return `${fence}${String(node.attrs?.language ?? "")}\n${text}\n${fence}`;
};

// The writing kit's blocks as CommonMark's. A node with no form here keeps its text as a paragraph, so the reader's
// words survive the export even where the structure does not
const blockSerializers: Record<string, (node: JSONContent) => string> = {
  blockquote: (node) => prefixLines(serializeBlocks(node.content ?? []), "> ", "> "),
  bulletList: (node) => serializeListItems(node.content ?? [], () => "- "),
  codeBlock: serializeCodeBlock,
  heading: (node) => `${"#".repeat(Number(node.attrs?.level ?? 1))} ${serializeInline(node.content ?? [])}`,
  horizontalRule: () => "---",
  orderedList: (node) => {
    const start = Number(node.attrs?.start ?? 1);
    return serializeListItems(node.content ?? [], (_item, index) => `${start + index}. `);
  },
  paragraph: serializeParagraph,
  taskList: (node) => serializeListItems(node.content ?? [], (item) => (item.attrs?.checked ? "- [x] " : "- [ ] ")),
};

const serializeBlock = (node: JSONContent): string => {
  const serializer = blockSerializers[node.type ?? ""];
  if (serializer) return serializer(node);

  return node.text === undefined ? serializeBlocks(node.content ?? []) : serializeParagraph({ content: [node] });
};

const serializeBlocks = (nodes: JSONContent[]): string => nodes.map(serializeBlock).filter(Boolean).join("\n\n");

// The Markdown file a note exports as, which deserializeNoteMarkdown reads back to the same document
export const serializeNoteMarkdown = (doc: JSONContent): string => {
  const markdown = serializeBlocks(doc.content ?? []);
  return markdown === "" ? "" : `${markdown}\n`;
};
