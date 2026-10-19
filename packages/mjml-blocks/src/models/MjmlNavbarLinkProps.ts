import type { BlockNodeProps } from "headless-block-editor";

// The props an MJML navbar link node holds: its attributes as MJML takes them, its content
export interface MjmlNavbarLinkProps extends BlockNodeProps {
  color?: string;
  content: string;
  "font-family"?: string;
  "font-size"?: string;
  "font-style"?: string;
  "font-weight"?: string;
  href?: string;
  "letter-spacing"?: string;
  "line-height"?: string;
  name?: string;
  padding?: string;
  "padding-bottom"?: string;
  "padding-left"?: string;
  "padding-right"?: string;
  "padding-top"?: string;
  rel?: string;
  target?: string;
  "text-decoration"?: string;
  "text-transform"?: string;
}
