import { deserializeLegacyEntity } from "#src/services/cutover/azure/deserializeLegacyEntity";
import { StreamTable } from "@esposter/db-schema";
import { describe, expect, test } from "vitest";

describe(deserializeLegacyEntity, () => {
  test("parses a legacy JSON property back and splits the system properties off", () => {
    expect.hasAssertions();

    const { entity, timestamp } = deserializeLegacyEntity(StreamTable.Messages, {
      etag: "W/\"datetime'x'\"",
      files: '[{"id":"a"}]',
      message: "[1,2]",
      partitionKey: "room",
      rowKey: "row",
      timestamp: "2026-11-14T00:00:00.000Z",
    });

    expect(entity).toStrictEqual({ files: [{ id: "a" }], message: "[1,2]", partitionKey: "room", rowKey: "row" });
    expect(timestamp).toStrictEqual(new Date("2026-11-14T00:00:00.000Z"));
  });
});
