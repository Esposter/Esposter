import type { JSONContent } from "@tiptap/core";
import type { Token, Tokens } from "marked";

import { checkIsAllowedUrl, DEFAULT_ALLOWED_SCHEMES } from "@esposter/shared";
import { marked } from "marked";

interface InlineMark {
  attrs?: Record<string, string>;
  type: string;
}

// Inline tokens whose children carry one mark, keyed by the token type marked gives them
const INLINE_MARK_TYPES: Record<string, string> = { del: "strike", em: "italic", strong: "bold" };

const getTokenText = (token: Token) => ("text" in token && typeof token.text === "string" ? token.text : token.raw);

const createTextNodes = (text: string, marks: InlineMark[] = []): JSONContent[] =>
  text === "" ? [] : [{ marks, text, type: "text" }];

const withMark = (nodes: JSONContent[], mark: InlineMark): JSONContent[] =>
  nodes.map((node) => (node.type === "text" ? { ...node, marks: [...(node.marks ?? []), mark] } : node));

// Adjacent text with the same marks is one run, which is how the editor holds it, so a token boundary does not split it
const mergeTextNodes = (nodes: JSONContent[]): JSONContent[] =>
  nodes.reduce<JSONContent[]>((merged, node) => {
    const previous = merged.at(-1);
    const isSameRun =
      node.type === "text" &&
      previous?.type === "text" &&
      JSON.stringify(previous.marks ?? []) === JSON.stringify(node.marks ?? []);
    if (!isSameRun) return [...merged, node];

    return [...merged.slice(0, -1), { ...previous, text: `${previous.text ?? ""}${node.text ?? ""}` }];
  }, []);

const mapInlineToken = (token: Token): JSONContent[] => {
  const markType = INLINE_MARK_TYPES[token.type];
  if (markType) return withMark(mapInlineTokens(token.tokens), { type: markType });

  // A link to a scheme that can run a script is kept as its text, the way the webpage's own links refuse it
  if (token.type === "link")
    return checkIsAllowedUrl(token.href, DEFAULT_ALLOWED_SCHEMES)
      ? withMark(mapInlineTokens(token.tokens), { attrs: { href: token.href }, type: "link" })
      : mapInlineTokens(token.tokens);

  if (token.type === "codespan") return createTextNodes(token.text, [{ type: "code" }]);

  if (token.type === "br") return [{ type: "hardBreak" }];

  // Escapes, plain text, an image's alt text and raw HTML keep their words. A node the kit has for HTML is not
  // reached: raw HTML is read as the text it carries, never as markup
  return "tokens" in token && token.tokens ? mapInlineTokens(token.tokens) : createTextNodes(getTokenText(token));
};

const mapInlineTokens = (tokens: Token[] = []): JSONContent[] => tokens.flatMap(mapInlineToken);

const createParagraph = (content: JSONContent[]): JSONContent =>
  content.length === 0 ? { type: "paragraph" } : { content: mergeTextNodes(content), type: "paragraph" };

// A container the kit requires a paragraph in starts with one, so a list item that opens on a nested list still has
// the paragraph its schema asks for
const withLeadingParagraph = (nodes: JSONContent[]): JSONContent[] =>
  nodes[0]?.type === "paragraph" ? nodes : [createParagraph([]), ...nodes];

const mapListItem = (item: Tokens.ListItem): JSONContent =>
  item.task
    ? {
        attrs: { checked: Boolean(item.checked) },
        content: withLeadingParagraph(mapBlockTokens(item.tokens)),
        type: "taskItem",
      }
    : { content: withLeadingParagraph(mapBlockTokens(item.tokens)), type: "listItem" };

const mapList = (token: Tokens.List): JSONContent => {
  // A task list holds only task items, so a list mixing both reads as the list it is and its checkboxes are dropped
  if (token.items.every((item) => item.task)) return { content: token.items.map(mapListItem), type: "taskList" };

  if (token.ordered)
    return {
      attrs: { start: typeof token.start === "number" ? token.start : 1 },
      content: token.items.map(mapListItem),
      type: "orderedList",
    };

  return { content: token.items.map(mapListItem), type: "bulletList" };
};

const mapBlockToken = (token: Token): JSONContent[] => {
  // A task item's checkbox is read into the item's checked attribute, so the token itself holds no text
  if (token.type === "space" || token.type === "checkbox") return [];

  if (token.type === "heading")
    return [{ attrs: { level: token.depth }, content: mapInlineTokens(token.tokens), type: "heading" }];

  if (token.type === "paragraph" || token.type === "text")
    return [createParagraph(mapInlineTokens(token.tokens ?? [token]))];

  if (token.type === "code")
    return [
      {
        attrs: { language: token.lang || null },
        ...(token.text === "" ? {} : { content: [{ text: token.text, type: "text" }] }),
        type: "codeBlock",
      },
    ];

  if (token.type === "blockquote") return [{ content: mapBlockTokens(token.tokens), type: "blockquote" }];

  if (token.type === "hr") return [{ type: "horizontalRule" }];

  if (token.type === "list") return [mapList(token)];

  // Raw HTML and a construct the kit has no node for (a table) keep their text, as a paragraph
  const text = getTokenText(token).trim();
  return text === "" ? [] : [createParagraph(createTextNodes(text))];
};

const mapBlockTokens = (tokens: Token[] = []): JSONContent[] => tokens.flatMap(mapBlockToken);

// The note a Markdown file imports as. Its shape is what the kit can hold, which the caller checks against the note's
// content schema before it replaces anything
export const deserializeNoteMarkdown = (markdown: string): JSONContent => {
  const blocks = mapBlockTokens(marked.lexer(markdown));
  return { content: blocks.length === 0 ? [createParagraph([])] : blocks, type: "doc" };
};
