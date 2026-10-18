import type { MjmlContentKind } from "#src/models/MjmlContentKind";

// MJML's own description of one component: its attributes in MJML's grammar, its defaults and the tags it may hold
export interface MjmlComponentSpecification {
  allowedAttributes: Record<string, string>;
  children: string[];
  contentKind: MjmlContentKind | undefined;
  defaultAttributes: Record<string, string>;
  hasAlternativeText: boolean;
  type: string;
}
