import type { BlockNodeProps } from "headless-block-editor";

// The props an MJML raw node holds: its attributes as MJML takes them, its content
export interface MjmlRawProps extends BlockNodeProps {
  content: string;
  position?: string;
}
