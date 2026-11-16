import type { AttributesTransformer } from "#src/models/sanitizeHtml/AttributesTransformer";

export interface SanitizeHtmlOptions {
  allowedAttributes?: Record<string, string[]>;
  allowedClasses?: Record<string, string[]>;
  // An element a tag names a source for is kept only when each named attribute is present and matches a pattern
  allowedSources?: Record<string, Record<string, RegExp[]>> | undefined;
  allowedStyles?: Record<string, Record<string, RegExp[]>>;
  allowedTags?: string[] | undefined;
  transformAttributes?: Record<string, AttributesTransformer>;
}
