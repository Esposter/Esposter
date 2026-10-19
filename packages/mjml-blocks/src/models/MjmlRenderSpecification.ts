import type { MjmlContentKind } from "#src/models/MjmlContentKind";
import type { MjmlNodeType } from "#src/models/MjmlNodeType";

// What a built-in component's render reads: its tag, its attributes in MJML's grammar, the kind of content it holds, whether it takes alternative text and whether it holds children
export interface MjmlRenderSpecification {
  allowedAttributes: Record<string, string>;
  contentKind?: MjmlContentKind;
  hasAlternativeText: boolean;
  hasChildren: boolean;
  tagName: MjmlNodeType;
}
