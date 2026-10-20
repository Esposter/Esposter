import { webpageNodeSchema } from "#shared/services/pageBuilder/webpageNodeSchema";
import { webpageRegistry } from "#shared/services/pageBuilder/webpageRegistry";
import { describe, expect, test } from "vitest";
import { z } from "zod";

// The type tags a schema accepts, read from its structure: a lazy's target, an array's element, a union's options and a node's literal type
const getAcceptedTypes = (schema: undefined | z.ZodType): string[] => {
  if (schema instanceof z.ZodLazy) return getAcceptedTypes(schema.unwrap());
  if (schema instanceof z.ZodArray) return getAcceptedTypes(schema.element);
  if (schema instanceof z.ZodDiscriminatedUnion) return schema.options.flatMap((option) => getAcceptedTypes(option));
  if (schema instanceof z.ZodObject) {
    const typeSchema = schema.shape.type;
    return typeSchema instanceof z.ZodLiteral ? [...typeSchema.values] : [];
  }
  return [];
};

describe("webpageRegistry", () => {
  test("a registry's slot lists match the node schema's accepted types", () => {
    expect.hasAssertions();

    const acceptedTypesByNode = Object.fromEntries(
      webpageRegistry.types.map((definition) => {
        const nodeSchema = webpageNodeSchema.options.find((option) =>
          getAcceptedTypes(option).includes(definition.type),
        );
        return [
          definition.type,
          Object.fromEntries(
            Object.keys(definition.slots).map((slot) => [
              slot,
              getAcceptedTypes(nodeSchema?.shape.props.shape[slot]).toSorted((left, right) =>
                left.localeCompare(right),
              ),
            ]),
          ),
        ];
      }),
    );
    const registeredTypesByNode = Object.fromEntries(
      webpageRegistry.types.map((definition) => [
        definition.type,
        Object.fromEntries(
          Object.entries(definition.slots).map(([slot, types]) => [
            slot,
            [...types].toSorted((left, right) => left.localeCompare(right)),
          ]),
        ),
      ]),
    );

    expect(acceptedTypesByNode).toStrictEqual(registeredTypesByNode);
  });
});
