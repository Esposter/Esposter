import type { MjmlAccordionNode } from "#src/models/MjmlAccordionNode";
import type { MjmlButtonNode } from "#src/models/MjmlButtonNode";
import type { MjmlCarouselNode } from "#src/models/MjmlCarouselNode";
import type { MjmlDividerNode } from "#src/models/MjmlDividerNode";
import type { MjmlImageNode } from "#src/models/MjmlImageNode";
import type { MjmlNavbarNode } from "#src/models/MjmlNavbarNode";
import type { MjmlRawNode } from "#src/models/MjmlRawNode";
import type { MjmlSocialNode } from "#src/models/MjmlSocialNode";
import type { MjmlSpacerNode } from "#src/models/MjmlSpacerNode";
import type { MjmlTableNode } from "#src/models/MjmlTableNode";
import type { MjmlTextNode } from "#src/models/MjmlTextNode";

// The nodes a column or a hero holds beside a consumer's leaf types: the built-in components that are neither a container nor a layout
export type MjmlFlowNode =
  | MjmlAccordionNode
  | MjmlButtonNode
  | MjmlCarouselNode
  | MjmlDividerNode
  | MjmlImageNode
  | MjmlNavbarNode
  | MjmlRawNode
  | MjmlSocialNode
  | MjmlSpacerNode
  | MjmlTableNode
  | MjmlTextNode;
