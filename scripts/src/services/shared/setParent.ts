import type { Node } from "oxc-parser";

import { parents } from "#src/services/shared/parents";

export const setParent = (node: Node, parent: Node): void => {
  parents.set(node, parent);
};
