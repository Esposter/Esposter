import type { BlockNodeProps } from "vue-block-editor-headless";

// The props an MJML navbar link node holds: its attributes as MJML takes them, its content
export interface MjmlNavbarLinkProps extends BlockNodeProps {
  color?: string | undefined;
  content: string;
  "font-family"?: string | undefined;
  "font-size"?: string | undefined;
  "font-style"?: string | undefined;
  "font-weight"?: string | undefined;
  href?: string | undefined;
  "letter-spacing"?: string | undefined;
  "line-height"?: string | undefined;
  name?: string | undefined;
  padding?: string | undefined;
  "padding-bottom"?: string | undefined;
  "padding-left"?: string | undefined;
  "padding-right"?: string | undefined;
  "padding-top"?: string | undefined;
  rel?: string | undefined;
  target?: string | undefined;
  "text-decoration"?: string | undefined;
  "text-transform"?: string | undefined;
}
