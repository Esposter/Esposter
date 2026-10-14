import type { ReadResourceContentInput } from "#shared/models/db/resource/ReadResourceContentInput";
import type { ReadResourceContentResult } from "#shared/models/resource/ReadResourceContentResult";
import type { Except } from "type-fest";

import { checkIsJsonSizeWithin } from "#server/services/resource/checkIsJsonSizeWithin";
import { MAX_AGENT_READ_SIZE } from "#server/services/resource/constants";
import { parseJsonPointer } from "#shared/services/jsonPatch/parseJsonPointer";
import { readJsonValue } from "#shared/services/jsonPatch/readJsonValue";
import { checkIsPlainObject, getResult } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

const getJsonSize = (value: unknown) => Buffer.byteLength(JSON.stringify(value));
const getMemberSizes = (members: [string, unknown][]) =>
  Object.fromEntries(members.map(([key, member]) => [key, getJsonSize(member)]));
// The stored JSON at a pointer, an array a page at a time with its length beside the page. Past the read cap the content
// Is left out and the size of each of its members answered instead, so the agent narrows the read rather than receive
// A truncated document
export const readContentAtPointer = (
  storedContent: unknown,
  { limit, offset, pointer }: Pick<ReadResourceContentInput, "limit" | "offset" | "pointer">,
): Except<ReadResourceContentResult, "contentVersion"> => {
  const value = getResult(() => readJsonValue(storedContent, parseJsonPointer(pointer))).match(
    (jsonValue) => jsonValue,
    (error) => {
      throw new TRPCError({ cause: error, code: "BAD_REQUEST", message: error.message });
    },
  );
  if (Array.isArray(value)) {
    const page = value.slice(offset, offset + limit);
    return checkIsJsonSizeWithin(page, MAX_AGENT_READ_SIZE)
      ? { content: page, length: value.length }
      : {
          length: value.length,
          memberSizes: getMemberSizes(page.map((member, index) => [`${offset + index}`, member])),
        };
  } else if (checkIsJsonSizeWithin(value, MAX_AGENT_READ_SIZE)) return { content: value };
  else if (checkIsPlainObject(value)) return { memberSizes: getMemberSizes(Object.entries(value)) };
  // A leaf has no members to size, so its own size is the one thing the read can say it withheld
  else return { size: getJsonSize(value) };
};
