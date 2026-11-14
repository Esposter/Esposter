import { LegacyAzureTable } from "#src/models/cutover/LegacyAzureTable";
import { deserializeLegacyEntity } from "#src/services/cutover/azure/deserializeLegacyEntity";
import { describe, expect, test } from "vitest";

describe(deserializeLegacyEntity, () => {
  const epoch = new Date(0);

  test("parses a legacy JSON property back and splits the system properties off", () => {
    expect.hasAssertions();

    const { entity, timestamp } = deserializeLegacyEntity(LegacyAzureTable.Messages, {
      etag: "W/\"datetime'x'\"",
      files: '[{"id":"a"}]',
      message: "[1,2]",
      partitionKey: "room",
      rowKey: "row",
      timestamp: epoch.toISOString(),
    });

    expect(entity).toStrictEqual({ files: [{ id: "a" }], message: "[1,2]", partitionKey: "room", rowKey: "row" });
    expect(timestamp).toStrictEqual(epoch);
  });
});
