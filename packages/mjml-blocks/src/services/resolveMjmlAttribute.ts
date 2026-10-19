import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";
import type { MjmlRootProps } from "#src/models/MjmlRootProps";
import type { BlockNode } from "headless-block-editor";

import { ALL_ATTRIBUTES_KEY } from "#src/services/constants";
import { getMjmlAttributeSchema } from "#src/services/getMjmlAttributeSchema";
import { getBlockPropValue } from "headless-block-editor";

// The root's value for all components applies to this type only where the type takes the attribute and its grammar accepts the value
const checkIsApplicableToType = (
  definition: Pick<MjmlBlockTypeDefinition, "allowedAttributes">,
  attributeName: string,
  value: string,
): boolean => {
  const schema = getMjmlAttributeSchema(definition.allowedAttributes, attributeName);
  return schema?.safeParse(value).success === true;
};

// The node's own value, then the root's for its type, then the root's for all, then MJML's default: each undefined where none sets it
export const resolveMjmlAttribute = (
  definition: Pick<MjmlBlockTypeDefinition, "allowedAttributes" | "defaultAttributes">,
  rootProps: MjmlRootProps,
  node: BlockNode,
  attributeName: string,
): string | undefined => {
  const ownValue = getBlockPropValue(node.props, attributeName);
  if (typeof ownValue === "string") return ownValue;

  const typeValue = rootProps.attributes?.[node.type]?.[attributeName];
  if (typeValue !== undefined) return typeValue;

  const allValue = rootProps.attributes?.[ALL_ATTRIBUTES_KEY]?.[attributeName];
  if (allValue !== undefined && checkIsApplicableToType(definition, attributeName, allValue)) return allValue;

  return definition.defaultAttributes[attributeName];
};
