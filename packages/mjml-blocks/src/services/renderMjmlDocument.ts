import type { MjmlDocument } from "#src/models/MjmlDocument";
import type { MjmlJson } from "#src/models/MjmlJson";
import type { MjmlRegistry } from "#src/models/MjmlRegistry";
import type { RenderMjmlDocumentOptions } from "#src/models/RenderMjmlDocumentOptions";

import { DIRECTION_ATTRIBUTE_KEY } from "#src/services/constants";
import { escapeMjmlAttributes } from "#src/services/escapeMjmlAttributes";
import { getFilledMjmlAttributes } from "#src/services/getFilledMjmlAttributes";
import { renderMjmlHead } from "#src/services/renderMjmlHead";
import { stampNode } from "#src/services/stampNode";
import { renderBlockNodes } from "vue-block-editor-headless";

// A validated document in MJML's JSON form: the root's language and direction, its head when it sets any, and the body
export const renderMjmlDocument = <TContext>(
  document: MjmlDocument,
  registry: MjmlRegistry<TContext>,
  options: RenderMjmlDocumentOptions<TContext>,
): MjmlJson => {
  const rootProps = document.root.props;
  const content: MjmlJson[] = renderBlockNodes(
    document.content,
    registry,
    registry.children,
    (node, definition, slots) => {
      const output = definition.render(node, slots, options.context);
      return stampNode(output, node, options.isStampingIds);
    },
  );
  const head = renderMjmlHead(rootProps);
  const rootAttributes: Record<string, string> = {};
  // An empty language is no language, so the attribute is written only when it has text
  if (rootProps.lang) rootAttributes.lang = rootProps.lang;
  if (rootProps.direction !== undefined) rootAttributes[DIRECTION_ATTRIBUTE_KEY] = rootProps.direction;

  return {
    attributes: escapeMjmlAttributes(rootAttributes),
    children: [
      ...(head.length > 0 ? [{ attributes: {}, children: head, tagName: "mj-head" }] : []),
      {
        attributes: escapeMjmlAttributes(getFilledMjmlAttributes(rootProps.body ?? {})),
        children: content,
        tagName: "mj-body",
      },
    ],
    tagName: "mjml",
  };
};
