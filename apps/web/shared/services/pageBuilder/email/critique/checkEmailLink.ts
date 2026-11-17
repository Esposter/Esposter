import type { CritiqueFinding } from "#shared/models/pageBuilder/CritiqueFinding";
import type { MjmlNode } from "mjml-blocks";

import { CritiqueFindingKind } from "#shared/models/pageBuilder/CritiqueFindingKind";
import { MjmlNodeType } from "mjml-blocks";

// A button or a navbar link goes nowhere with no address, and shows nothing to press with no text
export const checkEmailLink = (node: MjmlNode): CritiqueFinding[] => {
  if (node.type !== MjmlNodeType.Button && node.type !== MjmlNodeType.NavbarLink) return [];

  const { content, href, id } = node.props;
  return [
    ...(href ? [] : [{ kind: CritiqueFindingKind.LinkWithoutAddress, nodeId: id }]),
    ...(content ? [] : [{ kind: CritiqueFindingKind.LinkWithoutText, nodeId: id }]),
  ];
};
