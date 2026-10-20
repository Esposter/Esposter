import type { MjmlRegistry } from "#src/models/MjmlRegistry";
import type { MjmlRichText } from "#src/models/MjmlRichText";
import type { MjmlRichTextDefinition } from "#src/models/MjmlRichTextDefinition";
import type { HTMLElement } from "node-html-parser";

import { checkIsRepeatedMjmlTag } from "#src/services/checkIsRepeatedMjmlTag";
import { DIRECTION_ATTRIBUTE_KEY } from "#src/services/constants";
import { getMjmlRefusalKey } from "#src/services/getMjmlRefusalKey";
import { readMjmlHead } from "#src/services/readMjmlHead";
import { readMjmlNodes } from "#src/services/readMjmlNodes";
import { readMjmlStrayText } from "#src/services/readMjmlStrayText";

// The document's root props and body from its mjml element, the head read into the root's props and the body into its content
// The mjml element takes two attributes as root props, and any other is refused under its own name
export const readMjmlRoot = <TContext, TContent extends MjmlRichText>(
  mjml: HTMLElement,
  registry: MjmlRegistry<TContext>,
  richText: MjmlRichTextDefinition<TContent>,
): { content: unknown[]; root: { props: Record<string, unknown> } } => {
  const { [DIRECTION_ATTRIBUTE_KEY]: direction, lang, ...refusedAttributes } = mjml.attributes;
  const entries: [string, unknown][] = [
    ...Object.entries(readMjmlStrayText(mjml)),
    ...(direction === undefined ? [] : [["direction", direction] satisfies [string, string]]),
    ...(lang === undefined ? [] : [["lang", lang] satisfies [string, string]]),
  ];
  if (Object.keys(refusedAttributes).length > 0) entries.push([getMjmlRefusalKey("mjml"), refusedAttributes]);
  const readTagNames = new Set<string>();
  let content: unknown[] = [];
  for (const child of mjml.children) {
    // A second tag of a name already read is refused under its name, as a tag the package leaves out is, rather than merged into the first
    if (checkIsRepeatedMjmlTag(child.rawTagName, readTagNames)) {
      entries.push([getMjmlRefusalKey(child.rawTagName), child.attributes]);
      continue;
    }

    switch (child.rawTagName) {
      case "mj-body":
        entries.push(["body", child.attributes]);
        content = readMjmlNodes(child.childNodes, registry, richText);
        break;
      case "mj-head":
        entries.push(...readMjmlHead(child));
        break;
      default:
        entries.push([getMjmlRefusalKey(child.rawTagName), child.attributes]);
    }
  }

  return { content, root: { props: Object.fromEntries(entries) } };
};
