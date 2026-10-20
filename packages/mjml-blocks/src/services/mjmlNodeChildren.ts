import type { MjmlNode } from "#src/models/MjmlNode";
import type { BlockChildren } from "headless-block-editor";

import { MjmlNodeType } from "#src/models/MjmlNodeType";

// The children port of the email: each built-in node's slots as the typed lists its type holds, switched on the node's type tag
export const mjmlNodeChildren: BlockChildren<MjmlNode> = (node): Readonly<Record<string, readonly MjmlNode[]>> => {
  switch (node.type) {
    case MjmlNodeType.Accordion:
    case MjmlNodeType.AccordionElement:
    case MjmlNodeType.Carousel:
    case MjmlNodeType.Column:
    case MjmlNodeType.Group:
    case MjmlNodeType.Hero:
    case MjmlNodeType.Navbar:
    case MjmlNodeType.Section:
    case MjmlNodeType.Social:
    case MjmlNodeType.Wrapper:
      return { children: node.props.children };
    case MjmlNodeType.AccordionText:
    case MjmlNodeType.AccordionTitle:
    case MjmlNodeType.Button:
    case MjmlNodeType.CarouselImage:
    case MjmlNodeType.Divider:
    case MjmlNodeType.Image:
    case MjmlNodeType.NavbarLink:
    case MjmlNodeType.Raw:
    case MjmlNodeType.SocialElement:
    case MjmlNodeType.Spacer:
    case MjmlNodeType.Table:
    case MjmlNodeType.Text:
      return {};
    default:
      // A consumer's leaf type holds no slot: the leaf types are open, so the switch cannot name them
      return {};
  }
};
