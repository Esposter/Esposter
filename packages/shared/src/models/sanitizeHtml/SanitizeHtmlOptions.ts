import type { AttributesTransformer } from "#src/models/sanitizeHtml/AttributesTransformer";

export interface SanitizeHtmlOptions {
  allowedAttributes?: Record<string, string[]>;
  allowedClasses?: Record<string, string[]>;
  allowedStyles?: Record<string, Record<string, RegExp[]>>;
  allowedTags?: string[];
  transformAttributes?: Record<string, AttributesTransformer>;
}
