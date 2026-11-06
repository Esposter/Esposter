import type { BlockNodeProps } from "vue-block-editor-headless";

// The props an MJML raw node holds: its attributes as MJML takes them, its content
export interface MjmlRawProps extends BlockNodeProps {
  content: string;
  position?: string;
}
