import { parseJsonPointer, toJsonPointer } from "@esposter/shared";

// The pointer of the slot a node sits in, which is the node's own pointer without its last index
export const getNodeSlotPointer = (nodePointer: string) => toJsonPointer(parseJsonPointer(nodePointer).slice(0, -1));
