import type { MjmlAccordionElementNode } from "#src/models/MjmlAccordionElementNode";
import type { MjmlAccordionNode } from "#src/models/MjmlAccordionNode";
import type { MjmlAccordionTextNode } from "#src/models/MjmlAccordionTextNode";
import type { MjmlAccordionTitleNode } from "#src/models/MjmlAccordionTitleNode";
import type { MjmlButtonNode } from "#src/models/MjmlButtonNode";
import type { MjmlCarouselImageNode } from "#src/models/MjmlCarouselImageNode";
import type { MjmlCarouselNode } from "#src/models/MjmlCarouselNode";
import type { MjmlColumnNode } from "#src/models/MjmlColumnNode";
import type { MjmlDividerNode } from "#src/models/MjmlDividerNode";
import type { MjmlGroupNode } from "#src/models/MjmlGroupNode";
import type { MjmlHeroNode } from "#src/models/MjmlHeroNode";
import type { MjmlImageNode } from "#src/models/MjmlImageNode";
import type { MjmlLeafNode } from "#src/models/MjmlLeafNode";
import type { MjmlNavbarLinkNode } from "#src/models/MjmlNavbarLinkNode";
import type { MjmlNavbarNode } from "#src/models/MjmlNavbarNode";
import type { MjmlRawNode } from "#src/models/MjmlRawNode";
import type { MjmlSectionNode } from "#src/models/MjmlSectionNode";
import type { MjmlSocialElementNode } from "#src/models/MjmlSocialElementNode";
import type { MjmlSocialNode } from "#src/models/MjmlSocialNode";
import type { MjmlSpacerNode } from "#src/models/MjmlSpacerNode";
import type { MjmlTableNode } from "#src/models/MjmlTableNode";
import type { MjmlTextNode } from "#src/models/MjmlTextNode";
import type { MjmlWrapperNode } from "#src/models/MjmlWrapperNode";

// Any node an MJML document holds: one of its built-in types, or a leaf type a consumer declared
export type MjmlNode =
  | MjmlAccordionElementNode
  | MjmlAccordionNode
  | MjmlAccordionTextNode
  | MjmlAccordionTitleNode
  | MjmlButtonNode
  | MjmlCarouselImageNode
  | MjmlCarouselNode
  | MjmlColumnNode
  | MjmlDividerNode
  | MjmlGroupNode
  | MjmlHeroNode
  | MjmlImageNode
  | MjmlLeafNode
  | MjmlNavbarLinkNode
  | MjmlNavbarNode
  | MjmlRawNode
  | MjmlSectionNode
  | MjmlSocialElementNode
  | MjmlSocialNode
  | MjmlSpacerNode
  | MjmlTableNode
  | MjmlTextNode
  | MjmlWrapperNode;
