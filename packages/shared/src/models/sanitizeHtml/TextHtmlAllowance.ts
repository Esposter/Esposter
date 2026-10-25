import type { SanitizeHtmlOptions } from "#src/models/sanitizeHtml/SanitizeHtmlOptions";

// What one caller adds to the text policy: the tags and attributes beyond the shared writing kit, and the sources
// They must come from. A caller never widens the kit's own attributes or its URL schemes
export type TextHtmlAllowance = Pick<SanitizeHtmlOptions, "allowedAttributes" | "allowedSources" | "allowedTags">;
