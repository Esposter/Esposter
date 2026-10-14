import { getJsonByteSize } from "#server/services/resource/getJsonByteSize";
import { checkIsPlainObject } from "@esposter/shared";

// Whether a value serializes to at most `maxSize` bytes of JSON, found without serializing it. A value reached twice is
// Counted twice, as `JSON.stringify` writes it, and the walk stops once the running size passes the limit, so its cost
// Is bounded by the limit rather than by how far a value sharing its subtrees expands
export const checkIsJsonSizeWithin = (value: unknown, maxSize: number): boolean => {
  const pendingValues = [value];
  let size = 0;
  while (pendingValues.length > 0 && size <= maxSize) {
    const pendingValue = pendingValues.pop();
    if (Array.isArray(pendingValue)) {
      // Its brackets and a comma between each pair of items
      size += Math.max(pendingValue.length + 1, 2);
      for (const item of pendingValue) pendingValues.push(item);
    } else if (checkIsPlainObject(pendingValue)) {
      const entries = Object.entries(pendingValue);
      // Its braces, a comma between each pair of members, and each member's quoted key and colon
      size += Math.max(entries.length + 1, 2);
      for (const [key, member] of entries) {
        size += getJsonByteSize(key) + 1;
        pendingValues.push(member);
      }
    } else size += getJsonByteSize(pendingValue);
  }
  return size <= maxSize;
};
