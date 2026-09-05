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

export const sanitizeHtml = (...[html, options]: Parameters<typeof baseSanitizeHtml>): string =>
  baseSanitizeHtml(html, {
    ...options,
    allowedAttributes: {
      ...options?.allowedAttributes,
      table: ["style"],
      td: ["style"],
      th: ["style"],
    },
    transformTags: {
      ...options?.transformTags,
      table: (tagName, attribs) => ({
        attribs: { ...attribs, style: appendStyle(attribs.style, "width:100%; border-collapse: collapse;") },
        tagName,
      }),
      td: transformCellAlign,
      th: transformCellAlign,
    },
  });
