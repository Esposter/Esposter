import type { MjmlNode } from "mjml-blocks";

import { emailRegistry } from "#shared/services/pageBuilder/email/emailRegistry";
import { getBlockPropValue, getBlockTypeDefinition } from "headless-block-editor";

// The value an email node's attribute resolves to: the node's own prop when it sets one, else the default MJML's component
// Carries for it. The root's mj-attributes sit between the two once the root's head is read; until then a node's own
// Value and its component's default are the whole cascade
export const getEmailAttributeValue = (node: MjmlNode, attribute: string): string | undefined => {
  const own = getBlockPropValue(node.props, attribute);
  if (typeof own === "string") return own;

  return getBlockTypeDefinition(emailRegistry, node.type)?.defaultAttributes[attribute];
};
