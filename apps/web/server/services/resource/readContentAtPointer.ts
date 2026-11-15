import type { ReadResourceContentResult } from "#shared/models/resource/ReadResourceContentResult";
import type { PageCursor } from "@esposter/db-schema";
import type { Except } from "type-fest";

import { checkIsJsonSizeWithin } from "#server/services/resource/checkIsJsonSizeWithin";
import { MAX_AGENT_READ_SIZE } from "#server/services/resource/constants";
import { getJsonByteSize } from "#server/services/resource/getJsonByteSize";
import { encodePageCursor } from "@esposter/db-schema";
import { checkIsPlainObject, getResult, parseJsonPointer, readJsonValue } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

const getMemberSizes = (members: [string, unknown][]) =>
  Object.fromEntries(members.map(([key, member]) => [key, getJsonByteSize(member)]));
// The stored JSON at a pointer, an array a page at a time with its length beside the page and the cursor for the next.
// Past the read cap the content is left out and the size of each of its members answered instead, so the agent narrows
// The read rather than receive a truncated document
export const readContentAtPointer = (
  storedContent: unknown,
  { cursor, limit, pointer }: { cursor: PageCursor; limit: number; pointer: string },
): Except<ReadResourceContentResult, "contentVersion"> => {
  const value = getResult(() => readJsonValue(storedContent, parseJsonPointer(pointer))).match(
    (jsonValue) => jsonValue,
    (error) => {
      throw new TRPCError({ cause: error, code: "BAD_REQUEST", message: error.message });
    },
  );
  if (Array.isArray(value)) {
    // The cursor of an array holds the index of the item its page starts at. The read input refuses a negative or
    // Non-integer index, so the offset is a whole number from zero up
    const start = cursor.values[0];
    const offset = typeof start === "number" ? start : 0;
    const page = value.slice(offset, offset + limit);
    const nextOffset = offset + page.length;
    const nextCursor = nextOffset < value.length ? encodePageCursor({ isBackward: false, values: [nextOffset] }) : "";
    return checkIsJsonSizeWithin(page, MAX_AGENT_READ_SIZE)
      ? { content: page, length: value.length, nextCursor }
      : {
          length: value.length,
          memberSizes: getMemberSizes(page.map((member, index) => [`${offset + index}`, member])),
          nextCursor,
        };
  } else if (checkIsPlainObject(value))
    return checkIsJsonSizeWithin(value, MAX_AGENT_READ_SIZE)
      ? { content: value, nextCursor: "" }
      : { memberSizes: getMemberSizes(Object.entries(value)), nextCursor: "" };
  // A leaf has no members to size, so its own size is the one thing the read can say it withheld. It is serialized
  // Once, and that size both decides whether the leaf is returned and is the size returned when it is not
  const leafSize = getJsonByteSize(value);
  return leafSize <= MAX_AGENT_READ_SIZE ? { content: value, nextCursor: "" } : { nextCursor: "", size: leafSize };
};
