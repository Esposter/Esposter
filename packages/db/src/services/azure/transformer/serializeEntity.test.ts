import type { AzureEntity, AzureUpdateEntity } from "@esposter/db-schema";

import { serializeEntity } from "@/services/azure/transformer/serializeEntity";
import { describe, expect, test } from "vitest";

describe(serializeEntity, () => {
  test("serializes", () => {
    expect.hasAssertions();

    const entity: AzureUpdateEntity<AzureEntity & Record<string, unknown>> = {
      array: [],
      bool: true,
      date: new Date(0),
      number: 0,
      object: {},
      partitionKey: "",
      rowKey: "",
      string: "",
    };
    const serializedEntity = serializeEntity(entity);

    expect(serializedEntity).toStrictEqual({
      array: JSON.stringify(entity.array),
      bool: entity.bool,
      date: entity.date,
      number: entity.number,
      object: JSON.stringify(entity.object),
      partitionKey: entity.partitionKey,
      rowKey: entity.rowKey,
      string: entity.string,
    });
  });
});
