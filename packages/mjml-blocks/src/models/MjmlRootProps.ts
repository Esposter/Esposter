import type { MjmlDirection } from "#src/models/MjmlDirection";

// The document's head and body: what MJML writes outside the email's sections, each value as the author set it
export interface MjmlRootProps {
  attributes?: Record<string, Record<string, string>>;
  body?: Record<string, string>;
  breakpoint?: { width: string };
  direction?: MjmlDirection;
  fonts?: { href: string; name: string }[];
  lang?: string;
  preview?: string;
  styles?: { css: string; inline: boolean }[];
  title?: string;
}
