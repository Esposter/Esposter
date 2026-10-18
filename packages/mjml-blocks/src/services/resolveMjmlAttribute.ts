import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { MjmlRootProps } from "#src/models/MjmlRootProps";
import type { BlockNode } from "headless-block-editor";

import { ALL_ATTRIBUTES_KEY } from "#src/services/constants";
import { createMjmlAttributeSchema } from "#src/services/createMjmlAttributeSchema";
import { parseMjmlAttributeType } from "#src/services/parseMjmlAttributeType";

// The root's value for all components applies to this type only where the type takes the attribute and its grammar accepts the value
const checkIsApplicableToType = (
  definition: MjmlBlockTypeDefinition,
  attributeName: string,
  value: string,
): boolean => {
  const grammar = definition.allowedAttributes[attributeName];
  return (
    grammar !== undefined &&
    createMjmlAttributeSchema(parseMjmlAttributeType(grammar), attributeName).safeParse(value).success
  );
};

// The node's own value, then the root's for its type, then the root's for all, then MJML's default: each undefined where none sets it
export const resolveMjmlAttribute = (
  definition: MjmlBlockTypeDefinition,
  rootProps: MjmlRootProps,
  node: BlockNode,
  attributeName: string,
): string | undefined => {
  const ownValue = node.props[attributeName];
  if (typeof ownValue === "string") return ownValue;

  const typeValue = rootProps.attributes?.[node.type]?.[attributeName];
  if (typeValue !== undefined) return typeValue;

  const allValue = rootProps.attributes?.[ALL_ATTRIBUTES_KEY]?.[attributeName];
  if (allValue !== undefined && checkIsApplicableToType(definition, attributeName, allValue)) return allValue;

  return definition.defaultAttributes[attributeName];
};
