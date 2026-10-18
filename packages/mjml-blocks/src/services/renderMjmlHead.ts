import type { MjmlJson } from "#src/models/MjmlJson";
import type { MjmlRootProps } from "#src/models/MjmlRootProps";

import { ALL_ATTRIBUTES_KEY } from "#src/services/constants";
import { escapeMjmlAttributes } from "#src/services/escapeMjmlAttributes";
import { escapeText } from "@esposter/shared";

// The head components, each written only when the root's props set it, in the order MJML's head takes them
export const renderMjmlHead = (rootProps: MjmlRootProps): MjmlJson[] => {
  const head: MjmlJson[] = [];
  if (rootProps.title !== undefined)
    head.push({ attributes: {}, content: escapeText(rootProps.title), tagName: "mj-title" });
  if (rootProps.preview !== undefined)
    head.push({ attributes: {}, content: escapeText(rootProps.preview), tagName: "mj-preview" });

  for (const font of rootProps.fonts ?? [])
    head.push({ attributes: escapeMjmlAttributes({ href: font.href, name: font.name }), tagName: "mj-font" });
  if (rootProps.breakpoint)
    head.push({ attributes: escapeMjmlAttributes(rootProps.breakpoint), tagName: "mj-breakpoint" });

  const attributesByType = Object.entries(rootProps.attributes ?? {});
  if (attributesByType.length > 0)
    head.push({
      attributes: {},
      children: attributesByType.map(([type, attributes]) => ({
        attributes: escapeMjmlAttributes(attributes),
        tagName: type === ALL_ATTRIBUTES_KEY ? "mj-all" : type,
      })),
      tagName: "mj-attributes",
    });

  for (const style of rootProps.styles ?? [])
    head.push({ attributes: style.inline ? { inline: "inline" } : {}, content: style.css, tagName: "mj-style" });
  return head;
};
