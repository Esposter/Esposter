import type { MjmlBuiltInNode } from "#src/models/MjmlBuiltInNode";
import type { MjmlNode } from "#src/models/MjmlNode";

import { MjmlNodeType } from "#src/models/MjmlNodeType";
import { exhaustiveGuard } from "@esposter/shared";

// The children port of MJML's built-in nodes, switched on the type tag over every built-in type.
// Each type's slots are the typed lists its type holds.
// The leaf types are open, so a consumer's leaf type is not here.
// The consumer composes its own port over this one.
export const mjmlNodeChildren = (node: MjmlBuiltInNode): Readonly<Record<string, readonly MjmlNode[]>> => {
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
      return exhaustiveGuard(node);
  }
};
