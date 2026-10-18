import type { Element } from "#src/models/Element";

import { ELEMENTAL_NODE_STATUS_ID } from "#src/services/elementalNode/constants";

// The id of a node's buff status on an enemy, by its element, so each element's buff is one status
export const getElementalNodeStatusId = (element: Element): string => `${ELEMENTAL_NODE_STATUS_ID}:${element}`;
