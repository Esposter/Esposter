import type { MjmlDocument } from "#src/models/MjmlDocument";
import type { MjmlRichTextDefinition } from "#src/models/MjmlRichTextDefinition";
import type { MjmlRootProps } from "#src/models/MjmlRootProps";
import type { BlockNode, BlockRegistry, BlockTypeDefinition } from "headless-block-editor";
import type { HTMLElement } from "node-html-parser";
import type { z } from "zod";

import { MJML_BLOCK_TEXT_TAGS, STRAY_TEXT_TYPE } from "#src/services/constants";
import { readMjmlHead } from "#src/services/readMjmlHead";
import { readMjmlNodes } from "#src/services/readMjmlNodes";
import { normalizeString } from "@esposter/shared";
import { createBlockDocumentSchema } from "headless-block-editor";
import { parse, TextNode } from "node-html-parser";

// The document's root props and body from its mjml element, the head read into the root's props and the body into its content
const readMjmlRoot = <TContent>(
  mjml: HTMLElement,
  registry: BlockRegistry,
  richText: MjmlRichTextDefinition<TContent>,
): { content: BlockNode[]; root: { props: Record<string, unknown> } } => {
  const props: Record<string, unknown> = { ...mjml.attributes };
  let content: BlockNode[] = [];
  for (const text of mjml.childNodes)
    if (text instanceof TextNode && normalizeString(text.text) !== "") props[STRAY_TEXT_TYPE] = text.text;
  for (const child of mjml.children)
    switch (child.rawTagName) {
      case "mj-body":
        props.body = child.attributes;
        content = readMjmlNodes(child.childNodes, registry, richText);
        break;
      case "mj-head":
        Object.assign(props, readMjmlHead(child));
        break;
      default:
        props[child.rawTagName] = child.attributes;
    }

  return { content, root: { props } };
};

// The MJML source as a document, read by the registry's document schema: a tag the package leaves out, an attribute it does not take
// Or a value its type refuses is refused there, at the node it names
export const parseMjmlDocument = <TContent>(
  source: string,
  registry: BlockRegistry<BlockTypeDefinition, MjmlRootProps>,
  richText: MjmlRichTextDefinition<TContent>,
  maxNodes: number,
): z.ZodSafeParseResult<MjmlDocument> => {
  const root = parse(source, {
    blockTextElements: Object.fromEntries(MJML_BLOCK_TEXT_TAGS.map((tagName) => [tagName, true])),
    comment: false,
    lowerCaseTagName: false,
  });
  const [mjml] = root.children;
  const candidate =
    mjml?.rawTagName === "mjml"
      ? readMjmlRoot(mjml, registry, richText)
      : { content: [], root: { props: { [mjml?.rawTagName ?? "#document"]: {} } } };
  return createBlockDocumentSchema(registry, maxNodes).safeParse(candidate);
};
