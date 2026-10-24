import type { MjmlNode, MjmlRootProps } from "mjml-blocks";

import { emailRegistry } from "#shared/services/pageBuilder/email/emailRegistry";
import { getBlockPropValue, getBlockTypeDefinition } from "headless-block-editor";
import { ALL_ATTRIBUTES_KEY } from "mjml-blocks";

// The value an email node's attribute resolves to, in MJML's order: the node's own prop, then the root's mj-attributes
// For its tag, then the root's mj-all, then the default its component carries
export const getEmailAttributeValue = (
  node: MjmlNode,
  attribute: string,
  rootAttributes: MjmlRootProps["attributes"],
): string | undefined => {
  const own = getBlockPropValue(node.props, attribute);
  if (typeof own === "string") return own;

  return (
    rootAttributes?.[node.type]?.[attribute] ??
    rootAttributes?.[ALL_ATTRIBUTES_KEY]?.[attribute] ??
    getBlockTypeDefinition(emailRegistry, node.type)?.defaultAttributes[attribute]
  );
};
