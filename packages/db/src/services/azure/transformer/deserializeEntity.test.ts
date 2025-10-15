import type { SerializableValue } from "@esposter/db-schema";

import { deserializeEntity } from "@/services/azure/transformer/deserializeEntity";
import { AzureEntity } from "@esposter/db-schema";
import { jsonDateParse } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(deserializeEntity, () => {
  class Entity extends AzureEntity {
    array = [];
    bool = true;
    date = new Date(0);
    number = 0;
    object = {};
    string = "";

    constructor(init: Partial<Entity>) {
      super();
      Object.assign(this, init);
    }
  }

  test("deserializes", () => {
    expect.hasAssertions();

    const serializedEntity = {
      array: JSON.stringify([]),
      bool: true,
      date: new Date(0),
      number: 0,
      object: JSON.stringify({}),
      partitionKey: "",
      rowKey: "",
      string: "",
    } as const satisfies Partial<Record<keyof Entity, SerializableValue>>;
    const deserializedEntity = deserializeEntity(serializedEntity as unknown as Entity, Entity);

    expect(deserializedEntity).toStrictEqual(
      new Entity({
        array: jsonDateParse(serializedEntity.array),
        bool: serializedEntity.bool,
        date: serializedEntity.date,
        number: serializedEntity.number,
        object: jsonDateParse(serializedEntity.object),
        partitionKey: serializedEntity.partitionKey,
        rowKey: serializedEntity.rowKey,
        string: serializedEntity.string,
      }),
    );
  });
});
