import { html } from "parse5";

// The namespace every element this filter keeps is read in: an element in another one is unwrapped, never rendered
export const HTML_NAMESPACE: html.NS = html.NS.HTML;

// The tags a sanitised HTML keeps unless a caller names its own list. Every element here is text-bearing and
// Carries no script, style or embedded-document behaviour. img is not here: a caller that wants images names it
export const DEFAULT_ALLOWED_TAGS: string[] = [
  "address",
  "article",
  "aside",
  "footer",
  "header",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hgroup",
  "main",
  "nav",
  "section",
  "blockquote",
  "dd",
  "div",
  "dl",
  "dt",
  "figcaption",
  "figure",
  "hr",
  "li",
  "menu",
  "ol",
  "p",
  "pre",
  "ul",
  "a",
  "abbr",
  "b",
  "bdi",
  "bdo",
  "br",
  "cite",
  "code",
  "data",
  "dfn",
  "em",
  "i",
  "kbd",
  "mark",
  "q",
  "rb",
  "rp",
  "rt",
  "rtc",
  "ruby",
  "s",
  "samp",
  "small",
  "span",
  "strong",
  "sub",
  "sup",
  "time",
  "u",
  "var",
  "wbr",
  "caption",
  "col",
  "colgroup",
  "table",
  "tbody",
  "td",
  "tfoot",
  "th",
  "thead",
  "tr",
];

export const DEFAULT_LINK_ATTRIBUTES: string[] = ["href", "name", "target"];

export const DEFAULT_ALLOWED_ATTRIBUTES: Record<string, string[]> = { a: DEFAULT_LINK_ATTRIBUTES };

// The schemes a URL attribute may name. A scheme outside this list is dropped with its attribute, relative URLs
// Are kept, and so is a protocol-relative one
export const DEFAULT_ALLOWED_SCHEMES: string[] = ["http", "https", "ftp", "mailto", "tel"];

// Elements whose content is code or raw text, never shown text: the element and everything under it is dropped
// Whatever tags a caller allows, since keeping their text would show markup as words
export const NON_TEXT_TAGS: string[] = [
  "iframe",
  "noembed",
  "noframes",
  "noscript",
  "option",
  "plaintext",
  "script",
  "style",
  "textarea",
  "title",
  "xmp",
];

export const VOID_TAGS: string[] = [
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "source",
  "track",
  "wbr",
];

// Every attribute whose value a browser reads as an address, so its scheme is checked wherever a caller allows it
export const URL_ATTRIBUTES: string[] = [
  "action",
  "background",
  "cite",
  "data",
  "formaction",
  "href",
  "icon",
  "longdesc",
  "manifest",
  "poster",
  "src",
];

export const SRCSET_ATTRIBUTE = "srcset";

// Anchored at its one bang, so the expression reads the value once: a run of spaces before the bang is not rescanned from
// Each of its positions, which a leading whitespace class would do
// oxlint-disable-next-line typescript/no-inferrable-types -- the annotation is what --isolatedDeclarations needs
export const IMPORTANT_REGEX: RegExp = /!\s*important$/iu;

// The deepest element the filter renders. Deeper content is dropped rather than rendered, since a render recursion that
// Runs past the stack would throw on input a caller sent
export const MAX_NESTING_DEPTH = 256;

// oxlint-disable-next-line typescript/no-inferrable-types -- the annotation is what --isolatedDeclarations needs
export const SRCSET_DESCRIPTOR_REGEX: RegExp = /^(?:\d+w|\d*\.?\d+x|\d+h)$/u;

// oxlint-disable-next-line typescript/no-inferrable-types -- the annotation is what --isolatedDeclarations needs
export const ESCAPED_TEXT_CHARACTERS_REGEX: RegExp = /[&<>]/gu;
// oxlint-disable-next-line typescript/no-inferrable-types -- the annotation is what --isolatedDeclarations needs
export const ESCAPED_ATTRIBUTE_CHARACTERS_REGEX: RegExp = /[&"<>]/gu;

// The day the sanitiser last read its packages' advisories. The scripts workspace test fails on any advisory for sanitize-html
// Or dompurify published after it, so a new one starts a session through the next CI run
export const SANITIZER_ADVISORY_WATCH_SINCE = "2026-10-11";
