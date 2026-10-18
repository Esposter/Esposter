import type { MjmlDocument } from "#src/models/MjmlDocument";
import type { MjmlRichTextDefinition } from "#src/models/MjmlRichTextDefinition";
import type { MjmlRootProps } from "#src/models/MjmlRootProps";
import type { BlockNode, BlockRegistry, BlockTypeDefinition } from "headless-block-editor";
import type { HTMLElement } from "node-html-parser";
import type { z } from "zod";

import { MJML_BLOCK_TEXT_TAGS } from "#src/services/constants";
import { readMjmlHead } from "#src/services/readMjmlHead";
import { readMjmlNodes } from "#src/services/readMjmlNodes";
import { readMjmlStrayText } from "#src/services/readMjmlStrayText";
import { createBlockDocumentSchema } from "headless-block-editor";
import { parse } from "node-html-parser";

// The document's root props and body from its mjml element, the head read into the root's props and the body into its content
const readMjmlRoot = <TContent>(
  mjml: HTMLElement,
  registry: BlockRegistry,
  richText: MjmlRichTextDefinition<TContent>,
): { content: BlockNode[]; root: { props: Record<string, unknown> } } => {
  const props: Record<string, unknown> = { ...mjml.attributes, ...readMjmlStrayText(mjml) };
  let content: BlockNode[] = [];
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

// The top level beside the one mjml, refused by name: text outside it by the stray text type, a tag before it by its own name,
// and a second element by #document. A source of one mjml and nothing else reads no refusal here
const readMjmlTopLevel = (root: HTMLElement): Record<string, unknown> => {
  const [mjml, ...others] = root.children;
  const props: Record<string, unknown> = readMjmlStrayText(root);
  if (mjml?.rawTagName !== "mjml") props[mjml?.rawTagName ?? "#document"] = {};
  else if (others.length > 0) props["#document"] = {};
  return props;
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
  const topLevelProps = readMjmlTopLevel(root);
  const candidate =
    mjml?.rawTagName === "mjml" && Object.keys(topLevelProps).length === 0
      ? readMjmlRoot(mjml, registry, richText)
      : { content: [], root: { props: topLevelProps } };
  return createBlockDocumentSchema(registry, maxNodes).safeParse(candidate);
};
