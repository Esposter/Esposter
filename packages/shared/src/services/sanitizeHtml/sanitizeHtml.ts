import type { AttributesTransformer } from "#src/models/sanitizeHtml/AttributesTransformer";
import type { SanitizeHtmlOptions } from "#src/models/sanitizeHtml/SanitizeHtmlOptions";

import {
  DEFAULT_ALLOWED_ATTRIBUTES,
  DEFAULT_ALLOWED_SCHEMES,
  DEFAULT_ALLOWED_TAGS,
  DEFAULT_LINK_ATTRIBUTES,
} from "#src/services/sanitizeHtml/constants";
import { filterHtml } from "#src/services/sanitizeHtml/filterHtml";

const appendStyle = (style: string | undefined, declarations: string): string =>
  style ? `${style}; ${declarations}` : declarations;

// A cell's `align` attribute is dropped in favour of the equivalent style, so the one allowed attribute carries it
const transformCellAlign: AttributesTransformer = ({ align, ...attributes }) =>
  align ? { ...attributes, style: appendStyle(attributes.style, `text-align:${align}`) } : attributes;

// Every link rendered from HTML opens in a tab of its own, never the page it was read on, and whatever the markup asked
// For, the page it opens gets no handle back to ours: an author's rel="opener" would hand it one to navigate this tab
const transformLink: AttributesTransformer = (attributes) => ({
  ...attributes,
  rel: "noopener noreferrer nofollow",
  target: "_blank",
});

const transformTable: AttributesTransformer = (attributes) => ({
  ...attributes,
  style: appendStyle(attributes.style, "width:100%; border-collapse: collapse;"),
});

const TEXT_ALIGN_REGEXES = [/^(?:left|right|center|justify)$/u];
// A table keeps only the layout this sanitiser writes onto it. Its style attribute is allowed so that layout survives,
// And a style attribute no rule names is dropped, so an author's table cannot pin itself over the page
const TABLE_ALLOWED_STYLES: NonNullable<SanitizeHtmlOptions["allowedStyles"]> = {
  table: { "border-collapse": [/^collapse$/u], width: [/^100%$/u] },
  td: { "text-align": TEXT_ALIGN_REGEXES },
  th: { "text-align": TEXT_ALIGN_REGEXES },
};

export const sanitizeHtml = (html: string, options?: SanitizeHtmlOptions): string =>
  filterHtml(html, {
    // A caller naming no attributes keeps the defaults, a link's address among them
    allowedAttributes: {
      ...(options?.allowedAttributes ?? DEFAULT_ALLOWED_ATTRIBUTES),
      a: [...new Set([...(options?.allowedAttributes?.a ?? DEFAULT_LINK_ATTRIBUTES), "href", "rel", "target"])],
      table: ["style"],
      td: ["style"],
      th: ["style"],
    },
    allowedClasses: options?.allowedClasses ?? {},
    allowedSchemes: DEFAULT_ALLOWED_SCHEMES,
    allowedSources: options?.allowedSources ?? {},
    allowedStyles: { ...options?.allowedStyles, ...TABLE_ALLOWED_STYLES },
    allowedTags: options?.allowedTags ?? DEFAULT_ALLOWED_TAGS,
    transformAttributes: {
      ...options?.transformAttributes,
      a: transformLink,
      table: transformTable,
      td: transformCellAlign,
      th: transformCellAlign,
    },
  });
