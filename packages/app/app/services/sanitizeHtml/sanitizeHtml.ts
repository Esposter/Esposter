import baseSanitizeHtml from "sanitize-html";

export const sanitizeHtml = (...[html, options]: Parameters<typeof baseSanitizeHtml>) =>
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
        attribs: {
          ...attribs,
          style: "width:100%; border-collapse: collapse;",
        },
        tagName,
      }),
      td: (tagName, attribs) => {
        if (attribs.align) {
          attribs.style = `text-align:${attribs.align}`;
          delete attribs.align;
        }
        return { attribs, tagName };
      },
      th: (tagName, attribs) => {
        if (attribs.align) {
          attribs.style = `text-align:${attribs.align}`;
          delete attribs.align;
        }
        return { attribs, tagName };
      },
    },
  });
