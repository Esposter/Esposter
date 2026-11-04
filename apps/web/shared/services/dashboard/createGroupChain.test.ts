import { Visual } from "#shared/models/dashboard/data/Visual";
import { VisualType } from "#shared/models/dashboard/data/VisualType";
import { describe } from "vitest";

// A chain of groups, each holding the next and the last holding one plain visual, so the tree is as deep as the groups
export const createGroupChain = (groupCount: number): Visual[] =>
  groupCount === 0
    ? [new Visual({ type: VisualType.Area })]
    : [new Visual({ type: VisualType.Group, visuals: createGroupChain(groupCount - 1) })];

describe.todo("createGroupChain");
