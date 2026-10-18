import { toJsonPointer } from "@esposter/shared";

// The pointer of one prop of the node at a node pointer, with the prop's key escaped as one JSON pointer segment
export const getBlockPropPointer = (nodePointer: string, key: string): string =>
  `${nodePointer}/props${toJsonPointer([key])}`;
