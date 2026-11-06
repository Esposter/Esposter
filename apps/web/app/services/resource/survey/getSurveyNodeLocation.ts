import { parseArrayIndex, parseJsonPointer, toJsonPointer } from "@esposter/shared";

// The slot a node sits in and its index there, or none for a pointer that names no element of a slot
export const getSurveyNodeLocation = (nodePointer: string) => {
  const segments = parseJsonPointer(nodePointer);
  const index = parseArrayIndex(segments.at(-1) ?? "", Number.MAX_SAFE_INTEGER);
  return index === undefined ? undefined : { index, slotPointer: toJsonPointer(segments.slice(0, -1)) };
};
