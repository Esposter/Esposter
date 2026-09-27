import type { Tag, Transformer } from "sanitize-html";

import baseSanitizeHtml from "sanitize-html";

const appendStyle = (style: string | undefined, declarations: string): string =>
  style ? `${style}; ${declarations}` : declarations;
// A cell's `align` attribute is dropped in favour of the equivalent style, so the one allowed attribute
// Carries it. Identical for td and th.
const transformCellAlign: Transformer = (tagName, attribs): Tag => {
  if (attribs.align) {
    attribs.style = appendStyle(attribs.style, `text-align:${attribs.align}`);
    delete attribs.align;
  }
  return { attribs, tagName };
};

// Every link rendered from HTML opens in a tab of its own, never the page it was read on, and whatever the markup asked
// For, the page it opens gets no handle back to ours: an author's rel="opener" would hand it one to navigate this tab
const transformLink: Transformer = (tagName, attribs): Tag => ({
  attribs: { ...attribs, rel: "noopener noreferrer nofollow", target: "_blank" },
  tagName,
});

const TEXT_ALIGN_REGEXES = [/^(?:left|right|center|justify)$/u];
// A table keeps only the layout this sanitizer writes onto it. Its style attribute is allowed so that layout survives,
// And a style attribute no rule names passes whole, so without these an author's table could pin itself over the
// Page — a fixed, full-screen block dressed as the app's own UI
const TABLE_ALLOWED_STYLES: NonNullable<NonNullable<Parameters<typeof baseSanitizeHtml>[1]>["allowedStyles"]> = {
  table: { "border-collapse": [/^collapse$/u], width: [/^100%$/u] },
  td: { "text-align": TEXT_ALIGN_REGEXES },
  th: { "text-align": TEXT_ALIGN_REGEXES },
};

export const sanitizeHtml = (...[html, options]: Parameters<typeof baseSanitizeHtml>): string =>
  baseSanitizeHtml(html, {
    ...options,
    // A caller naming no attributes keeps the library's defaults, a link's address among them
    allowedAttributes: {
      ...(options?.allowedAttributes || baseSanitizeHtml.defaults.allowedAttributes),
      a: ["href", "rel", "target"],
      table: ["style"],
      td: ["style"],
      th: ["style"],
    },
    allowedStyles: { ...options?.allowedStyles, ...TABLE_ALLOWED_STYLES },
    transformTags: {
      ...options?.transformTags,
      a: transformLink,
      table: (tagName, attribs) => ({
        attribs: { ...attribs, style: appendStyle(attribs.style, "width:100%; border-collapse: collapse;") },
        tagName,
      }),
      td: transformCellAlign,
      th: transformCellAlign,
    },
  });
