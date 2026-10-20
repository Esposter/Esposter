import type { MjmlDocument } from "#src/models/MjmlDocument";
import type { MjmlNode } from "#src/models/MjmlNode";
import type { MjmlRegistry } from "#src/models/MjmlRegistry";
import type { MjmlRichTextDefinition } from "#src/models/MjmlRichTextDefinition";
import type { HTMLElement } from "node-html-parser";
import type { z } from "zod";

import { DIRECTION_ATTRIBUTE_KEY, MJML_BLOCK_TEXT_TAGS } from "#src/services/constants";
import { createMjmlDocumentSchema } from "#src/services/createMjmlDocumentSchema";
import { getMjmlRefusalKey } from "#src/services/getMjmlRefusalKey";
import { readMjmlHead } from "#src/services/readMjmlHead";
import { readMjmlNodes } from "#src/services/readMjmlNodes";
import { readMjmlStrayText } from "#src/services/readMjmlStrayText";
import { parse } from "node-html-parser";

// The document's root props and body from its mjml element, the head read into the root's props and the body into its content
// The mjml element takes two attributes as root props, and any other is refused under its own name
const readMjmlRoot = <TContext, TContent>(
  mjml: HTMLElement,
  registry: MjmlRegistry<TContext>,
  richText: MjmlRichTextDefinition<TContent>,
) => {
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
    if (readTagNames.has(child.rawTagName)) {
      entries.push([getMjmlRefusalKey(child.rawTagName), child.attributes]);
      continue;
    }

    readTagNames.add(child.rawTagName);
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

// The top level beside the one mjml, refused by name: text outside it by the stray text type, a tag before it under its own name,
// And a second element by #document. A source of one mjml and nothing else reads no refusal here
const readMjmlTopLevel = (root: HTMLElement): [string, unknown][] => {
  const [mjml, ...others] = root.children;
  const strayText: [string, unknown][] = Object.entries(readMjmlStrayText(root));
  if (mjml?.rawTagName !== "mjml")
    return [...strayText, [mjml === undefined ? "#document" : getMjmlRefusalKey(mjml.rawTagName), {}]];
  if (others.length > 0) return [...strayText, ["#document", {}]];
  return strayText;
};

// The MJML source as a document, read by the registry's document schema: a tag the package leaves out, an attribute it does not take
// Or a value its type refuses is refused there, at the node it names
export const parseMjmlDocument = <TContext, TContent>(
  source: string,
  registry: MjmlRegistry<TContext>,
  nodeSchema: z.ZodType<MjmlNode>,
  richText: MjmlRichTextDefinition<TContent>,
  maxNodes: number,
): z.ZodSafeParseResult<MjmlDocument> => {
  const root = parse(source, {
    blockTextElements: Object.fromEntries(MJML_BLOCK_TEXT_TAGS.map((tagName) => [tagName, true])),
    comment: false,
    lowerCaseTagName: false,
  });
  const [mjml] = root.children;
  const topLevelEntries = readMjmlTopLevel(root);
  const candidate =
    mjml?.rawTagName === "mjml" && topLevelEntries.length === 0
      ? readMjmlRoot(mjml, registry, richText)
      : { content: [], root: { props: Object.fromEntries(topLevelEntries) } };
  return createMjmlDocumentSchema(registry, nodeSchema, maxNodes).safeParse(candidate);
};
