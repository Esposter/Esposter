import { readStreamRow } from "#src/services/streams/readStreamRow";
import { serializeEntity } from "#src/services/streams/serializeEntity";
import { describe, expect, test } from "vitest";

describe(serializeEntity, () => {
  test("writes a Date as its date member, and every other value as it is", () => {
    expect.hasAssertions();

    const epoch = new Date(0);
    const entity = { array: [], date: epoch, partitionKey: "", rowKey: "", string: "" };

    expect(serializeEntity(entity)).toStrictEqual({ ...entity, date: { date: epoch.toISOString() } });
  });

  test("reads a Date back from the row it was written to", () => {
    expect.hasAssertions();

    const epoch = new Date(0);
    const row = readStreamRow({
      entity: serializeEntity({ date: epoch, partitionKey: "p", rowKey: "r" }),
      etag: "e",
      partitionKey: "p",
      rowKey: "r",
    });

    expect(row.date).toStrictEqual(epoch);
  });
});
