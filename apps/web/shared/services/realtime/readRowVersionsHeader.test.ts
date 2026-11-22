import { ROW_VERSIONS_HEADER, TOPICS_HEADER_SEPARATOR } from "#shared/services/realtime/constants";
import { formatRowVersionHeaderValue } from "#shared/services/realtime/formatRowVersionHeaderValue";
import { readRowVersionsHeader } from "#shared/services/realtime/readRowVersionsHeader";
import { usersInAuth } from "@esposter/db-schema";
import { getTableName } from "drizzle-orm";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(readRowVersionsHeader, () => {
  const path = "post.createPost";
  const table = getTableName(usersInAuth);

  test("reads a row back as it was formatted, a key value holding the header's separators included", () => {
    expect.hasAssertions();

    const rowVersion = { key: { id: "a b,c" }, table, version: 0 };
    const headers = new Headers();
    headers.append(ROW_VERSIONS_HEADER, formatRowVersionHeaderValue(path, rowVersion));

    expect(readRowVersionsHeader(headers, path)).toStrictEqual([rowVersion]);
  });

  test("leaves out an entry for another path", () => {
    expect.hasAssertions();

    const rowVersion = { key: { id: v7() }, table, version: 0 };
    const otherRowVersion = { key: { id: v7() }, table, version: 1 };
    const headers = new Headers();
    headers.append(ROW_VERSIONS_HEADER, formatRowVersionHeaderValue("friend.addFriend", otherRowVersion));
    headers.append(ROW_VERSIONS_HEADER, formatRowVersionHeaderValue(path, rowVersion));

    expect(readRowVersionsHeader(headers, path)).toStrictEqual([rowVersion]);
  });

  test.each([
    ["a version below zero", { key: { id: v7() }, table, version: -1 }],
    ["a version that is not whole", { key: { id: v7() }, table, version: 0.1 }],
    ["a key value that is neither a string nor a number", { key: { id: true }, table, version: 0 }],
    ["no table", { key: { id: v7() }, version: 0 }],
  ])("drops an entry that does not read back, and keeps the rest: %s", (_title, invalidRowVersion) => {
    expect.hasAssertions();

    const rowVersion = { key: { id: v7() }, table, version: 0 };
    const invalidValue = `${path}${TOPICS_HEADER_SEPARATOR}${encodeURIComponent(JSON.stringify(invalidRowVersion))}`;
    const headers = new Headers();
    headers.append(ROW_VERSIONS_HEADER, invalidValue);
    headers.append(ROW_VERSIONS_HEADER, formatRowVersionHeaderValue(path, rowVersion));

    expect(readRowVersionsHeader(headers, path)).toStrictEqual([rowVersion]);
  });

  test("reads back every value appended under the header", () => {
    expect.hasAssertions();

    const firstRowVersion = { key: { id: v7() }, table, version: 0 };
    const secondRowVersion = { key: { id: v7() }, table, version: 1 };
    const headers = new Headers();
    headers.append(ROW_VERSIONS_HEADER, formatRowVersionHeaderValue(path, firstRowVersion));
    headers.append(ROW_VERSIONS_HEADER, formatRowVersionHeaderValue(path, secondRowVersion));

    expect(readRowVersionsHeader(headers, path)).toStrictEqual([firstRowVersion, secondRowVersion]);
  });
});
