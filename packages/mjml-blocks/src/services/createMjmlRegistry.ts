import type { CreateMjmlRegistryOptions } from "#src/models/CreateMjmlRegistryOptions";
import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { MjmlComponentSpecification } from "#src/models/MjmlComponentSpecification";
import type { MjmlRegistry } from "#src/models/MjmlRegistry";
import type { MjmlRichTextDefinition } from "#src/models/MjmlRichTextDefinition";

import { MJML_BODY_CHILDREN, MJML_COMPONENT_SPECIFICATIONS, MJML_LEAF_HOST_TYPES } from "#src/services/constants";
import { createMjmlPropsSchema } from "#src/services/createMjmlPropsSchema";
import { createMjmlRootPropsSchema } from "#src/services/createMjmlRootPropsSchema";
import { renderMjmlNode } from "#src/services/renderMjmlNode";

// A component's definition, with the consumer's leaf types appended to the children of the containers MJML lets hold them
const createMjmlDefinition = <TContent, TContext>(
  specification: MjmlComponentSpecification,
  richText: MjmlRichTextDefinition<TContent>,
  leafTypeNames: string[],
): MjmlBlockTypeDefinition<TContext> => {
  const children = MJML_LEAF_HOST_TYPES.includes(specification.type)
    ? [...specification.children, ...leafTypeNames]
    : specification.children;
  return {
    allowedAttributes: specification.allowedAttributes,
    defaultAttributes: specification.defaultAttributes,
    propsSchema: createMjmlPropsSchema(specification, richText),
    render: renderMjmlNode(specification, richText),
    slots: children.length > 0 ? { children } : {},
    type: specification.type,
  };
};

// MJML's component set as block types, with the consumer's leaf types beside them and the body's children as the root's content
export const createMjmlRegistry = <TContent, TContext = undefined>(
  options: CreateMjmlRegistryOptions<TContent, TContext>,
): MjmlRegistry<TContext> => {
  const leafTypeNames = options.leafTypes.map((leafType) => leafType.type);
  const types = [
    ...MJML_COMPONENT_SPECIFICATIONS.map((specification) =>
      createMjmlDefinition<TContent, TContext>(specification, options.richText, leafTypeNames),
    ),
    ...options.leafTypes,
  ];
  return { root: { content: MJML_BODY_CHILDREN, propsSchema: createMjmlRootPropsSchema(types) }, types };
};
