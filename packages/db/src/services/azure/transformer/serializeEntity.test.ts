import type { AzureEntity, AzureUpdateEntity } from "@esposter/db-schema";

import { serializeEntity } from "@/services/azure/transformer/serializeEntity";
import { describe, expect, test } from "vitest";

describe(serializeEntity, () => {
  test("serializes", () => {
    expect.hasAssertions();

    const entity = {
      array: [],
      bool: true,
      date: new Date(0),
      number: 0,
      object: {},
      partitionKey: "",
      rowKey: "",
      string: "",
    } as const satisfies AzureUpdateEntity<AzureEntity & Record<string, unknown>>;
    const serializedEntity = serializeEntity(entity);

    expect(serializedEntity).toStrictEqual({
      ...entity,
      array: JSON.stringify(entity.array),
      object: JSON.stringify(entity.object),
    });
  });
});
