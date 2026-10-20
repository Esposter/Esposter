import { webpageNodeSchema, webpagePlaceableNodeSchema } from "#shared/services/pageBuilder/webpageNodeSchema";
import { webpageRegistry } from "#shared/services/pageBuilder/webpageRegistry";
import { describe, expect, test } from "vitest";
import { z } from "zod";

// The type tags a schema accepts, read from its structure: a lazy's target, an array's element, a union's options and a node's literal type
const getAcceptedTypes = (schema: unknown): string[] => {
  if (schema instanceof z.ZodLazy) return getAcceptedTypes(schema.unwrap());
  if (schema instanceof z.ZodArray) return getAcceptedTypes(schema.element);
  if (schema instanceof z.ZodDiscriminatedUnion) return schema.options.flatMap((option) => getAcceptedTypes(option));
  if (schema instanceof z.ZodObject) {
    const typeSchema = schema.shape.type;
    return typeSchema instanceof z.ZodLiteral
      ? [...typeSchema.values].filter((value) => typeof value === "string")
      : [];
  }
  return [];
};
const sortTypes = (types: readonly string[]): string[] =>
  [...types].toSorted((left, right) => left.localeCompare(right));

describe("webpageRegistry", () => {
  test("a registry's slot lists and root content match the node schemas' accepted types", () => {
    expect.hasAssertions();

    const acceptedTypesByNode = Object.fromEntries(
      webpageRegistry.types.map((definition) => {
        const nodeSchema = webpageNodeSchema.options.find((option) =>
          getAcceptedTypes(option).includes(definition.type),
        );
        const propsSchema = nodeSchema?.shape.props;
        return [
          definition.type,
          Object.fromEntries(
            Object.keys(definition.slots).map((slot) => [
              slot,
              sortTypes(getAcceptedTypes(Object.entries(propsSchema?.shape ?? {}).find(([key]) => key === slot)?.[1])),
            ]),
          ),
        ];
      }),
    );
    const registeredTypesByNode = Object.fromEntries(
      webpageRegistry.types.map((definition) => {
        const slots: Readonly<Record<string, readonly string[]>> = definition.slots;
        return [
          definition.type,
          Object.fromEntries(Object.entries(slots).map(([slot, types]) => [slot, sortTypes(types)])),
        ];
      }),
    );

    expect(acceptedTypesByNode).toStrictEqual(registeredTypesByNode);
    expect(sortTypes(getAcceptedTypes(webpagePlaceableNodeSchema))).toStrictEqual(
      sortTypes(webpageRegistry.root.content),
    );
  });
});
