import type { MjmlDirection } from "#src/models/MjmlDirection";

// The document's head and body: what MJML writes outside the email's sections, each value as the author set it
export interface MjmlRootProps {
  attributes?: Record<string, Record<string, string>> | undefined;
  body?: Record<string, string> | undefined;
  breakpoint?: undefined | { width: string };
  direction?: MjmlDirection | undefined;
  fonts?: undefined | { href: string; name: string }[];
  lang?: string | undefined;
  preview?: string | undefined;
  styles?: undefined | { css: string; inline: boolean }[];
  title?: string | undefined;
}
