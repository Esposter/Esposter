import type { AttributesTransformer } from "#src/models/sanitizeHtml/AttributesTransformer";

export interface SanitizePolicy {
  allowedAttributes: Record<string, string[]>;
  allowedClasses: Record<string, string[]>;
  allowedSchemes: string[];
  allowedStyles: Record<string, Record<string, RegExp[]>>;
  allowedTags: string[];
  transformAttributes: Record<string, AttributesTransformer>;
}
