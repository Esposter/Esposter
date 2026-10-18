import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { MjmlDocument } from "#src/models/MjmlDocument";
import type { MjmlJson } from "#src/models/MjmlJson";
import type { MjmlRegistry } from "#src/models/MjmlRegistry";
import type { RenderMjmlDocumentOptions } from "#src/models/RenderMjmlDocumentOptions";
import type { BlockNode } from "headless-block-editor";

import { escapeMjmlAttributes } from "#src/services/escapeMjmlAttributes";
import { renderMjmlHead } from "#src/services/renderMjmlHead";
import { escapeAttribute } from "@esposter/shared";
import { renderBlockNodes } from "headless-block-editor";
import { z } from "zod";

// A node's output gains its id as its css-class when the render stamps ids, so the proof can find its box in the email
const stampNode = (output: MjmlJson, node: BlockNode, isStampingIds: boolean): MjmlJson => {
  if (!isStampingIds) return output;

  const id = z.string().parse(node.props.id);
  return { ...output, attributes: { ...output.attributes, "css-class": escapeAttribute(id) } };
};

// A validated document in MJML's JSON form: the root's language and direction, its head when it sets any, and the body
export const renderMjmlDocument = <TContext>(
  document: MjmlDocument,
  registry: MjmlRegistry<TContext>,
  options: RenderMjmlDocumentOptions<TContext>,
): MjmlJson => {
  const rootProps = document.root.props;
  const content = renderBlockNodes<MjmlBlockTypeDefinition<TContext>, MjmlJson>(
    document.content,
    registry,
    (node, definition, slots) => {
      const output = definition.render(node, slots, options.context);
      return stampNode(output, node, options.isStampingIds);
    },
  );
  const head = renderMjmlHead(rootProps);
  const rootAttributes: Record<string, string> = {};
  if (rootProps.lang !== undefined) rootAttributes.lang = rootProps.lang;
  if (rootProps.dir !== undefined) rootAttributes.dir = rootProps.dir;

  return {
    attributes: escapeMjmlAttributes(rootAttributes),
    children: [
      ...(head.length > 0 ? [{ attributes: {}, children: head, tagName: "mj-head" }] : []),
      { attributes: escapeMjmlAttributes(rootProps.body ?? {}), children: content, tagName: "mj-body" },
    ],
    tagName: "mjml",
  };
};
