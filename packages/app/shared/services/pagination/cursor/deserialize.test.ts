import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { deserialize } from "#shared/services/pagination/cursor/deserialize";
import { serialize } from "#shared/services/pagination/cursor/serialize";
import { describe, expect, test } from "vitest";

describe(deserialize, () => {
  test("deserializes", () => {
    expect.hasAssertions();

    const item = { "": "" };

    const serialized = serialize(item, [{ key: "", order: SortOrder.Asc }]);
    const deserialized = deserialize(serialized);

    expect(deserialized).toStrictEqual(item);
  });
});
