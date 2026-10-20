import type { MjmlDocument } from "#src/models/MjmlDocument";
import type { MjmlNode } from "#src/models/MjmlNode";
import type { MjmlRegistry } from "#src/models/MjmlRegistry";
import type { MjmlRichText } from "#src/models/MjmlRichText";
import type { MjmlRichTextDefinition } from "#src/models/MjmlRichTextDefinition";
import type { z } from "zod";

import { MJML_BLOCK_TEXT_TAGS } from "#src/services/constants";
import { createMjmlDocumentSchema } from "#src/services/createMjmlDocumentSchema";
import { readMjmlRoot } from "#src/services/readMjmlRoot";
import { readMjmlTopLevel } from "#src/services/readMjmlTopLevel";
import { parse } from "node-html-parser";

// The MJML source as a document, read by the registry's document schema: a tag the package leaves out, an attribute it does not take
// Or a value its type refuses is refused there, at the node it names
export const parseMjmlDocument = <TContext, TContent extends MjmlRichText>(
  source: string,
  registry: MjmlRegistry<TContext>,
  bodyChildrenSchema: z.ZodType<MjmlNode>,
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
  return createMjmlDocumentSchema(registry, bodyChildrenSchema, maxNodes).safeParse(candidate);
};
