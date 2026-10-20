import type { BlockChildren } from "#src/models/BlockChildren";
import type { BlockSlots } from "#src/models/BlockChildren";
import type { SectionNode, TestNode } from "#src/services/constants.test";

export type PortReturnForSection = ReturnType<BlockChildren<SectionNode>>["children"];
// The port's per-type return over the whole node union, a read of one node type's slot, and the record the port returned before
export type PortReturnOverUnion = ReturnType<BlockChildren<TestNode>>;
export type RecordPortReturnOverUnion = Readonly<Record<string, readonly TestNode[]>>;
export type SlotsOfUnion = BlockSlots<TestNode>;
