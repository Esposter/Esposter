import type { SerializableValue } from "@esposter/db-schema";
import type { ExcludeFunctionProperties } from "@esposter/shared";

import { deserializeEntity } from "@/services/azure/transformer/deserializeEntity";
import { AzureEntity } from "@esposter/db-schema";
import { ItemMetadata, jsonDateParse } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(deserializeEntity, () => {
  class Entity extends AzureEntity {
    array = [];
    bool = true;
    date = new Date(0);
    number = 0;
    object = {};
    string = "";

    constructor(init?: Partial<Entity>) {
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
      // eslint-disable-next-line @typescript-eslint/no-misused-spread
      ...new ItemMetadata(),
    } as const satisfies Record<keyof ExcludeFunctionProperties<Entity>, SerializableValue>;
    const deserializedEntity = deserializeEntity(serializedEntity, Entity);

    expect(deserializedEntity).toStrictEqual(
      new Entity({
        ...serializedEntity,
        array: jsonDateParse(serializedEntity.array),
        object: jsonDateParse(serializedEntity.object),
      }),
    );
  });
});
