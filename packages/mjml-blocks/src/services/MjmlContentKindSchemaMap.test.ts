import { MjmlContentKind } from "#src/models/MjmlContentKind";
import { TEST_REGISTRY } from "#src/services/constants.test";
import { MjmlContentKindSchemaMap } from "#src/services/MjmlContentKindSchemaMap";
import { assert, describe, expect, test } from "vitest";
import { z } from "zod";

describe("mjmlContentKindSchemaMap", () => {
  // A label-kind or raw-kind component's content schema is the map's entry for its kind, never a copy of it
  const CONTENT_ROWS = TEST_REGISTRY.types.flatMap((definition) =>
    definition.contentKind === MjmlContentKind.Label || definition.contentKind === MjmlContentKind.Raw
      ? [[definition.type, definition.contentKind, definition.propsSchema] as const]
      : [],
  );

  test.each(CONTENT_ROWS)("%s's content schema is its kind's entry in the map", (_type, contentKind, propsSchema) => {
    expect.hasAssertions();

    assert.instanceOf(propsSchema, z.ZodObject);
    expect(propsSchema.shape.content).toBe(MjmlContentKindSchemaMap[contentKind]);
  });
});
