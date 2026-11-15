// The tags a node type's render writes, and nothing else
export const HtmlTag = {
  A: "a",
  Button: "button",
  Div: "div",
  Footer: "footer",
  Header: "header",
  Img: "img",
  Main: "main",
  Section: "section",
  Span: "span",
  Video: "video",
} as const;
export type HtmlTag = (typeof HtmlTag)[keyof typeof HtmlTag];
