import { getIdsFromKey } from "@/services/message/subscribables/getIdsFromKey";
import { getIdsKey } from "@/services/message/subscribables/getIdsKey";
import { describe, expect, test } from "vitest";

describe(getIdsFromKey, () => {
  // Ids are uuids, which hold hyphens, so a separator that is not a comma must not split inside one
  test("returns the ids a key was built from, uuids included", () => {
    expect.hasAssertions();

    const ids = [crypto.randomUUID(), crypto.randomUUID()].toSorted();

    expect(getIdsFromKey(getIdsKey(ids.map((id) => ({ id }))))).toStrictEqual(ids);
  });

  test("returns no ids for an empty key", () => {
    expect.hasAssertions();

    expect(getIdsFromKey("")).toStrictEqual([]);
  });
});
