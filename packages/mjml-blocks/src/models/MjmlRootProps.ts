import { MjmlDirection } from "#src/models/MjmlDirection";

// The document's head and body: what MJML writes outside the email's sections, each value as the author set it. An object
// Type alias rather than an interface, since an interface takes no implicit index signature and the core's root props need one
export type MjmlRootProps = {
  attributes?: Record<string, Record<string, string>>;
  body?: Record<string, string>;
  breakpoint?: { width: string };
  direction?: MjmlDirection;
  fonts?: { href: string; name: string }[];
  lang?: string;
  preview?: string;
  styles?: { css: string; inline: boolean }[];
  title?: string;
};
