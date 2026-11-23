import type { MjmlDirection } from "#src/models/MjmlDirection";

// The document's head and body: what MJML writes outside the email's sections, each value as the author set it
export interface MjmlRootProps {
  attributes?: Record<string, Record<string, string>> | undefined;
  body?: Record<string, string> | undefined;
  breakpoint?: { width: string } | undefined;
  direction?: MjmlDirection | undefined;
  fonts?: { href: string; name: string }[] | undefined;
  // Empty when the email sets no language, so no language attribute is written
  lang: string;
  preview?: string | undefined;
  styles?: { css: string; inline: boolean }[] | undefined;
  // Empty when the email sets no title, so no title element is written
  title: string;
}
