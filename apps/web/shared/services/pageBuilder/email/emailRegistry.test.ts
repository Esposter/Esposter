import { emailNodeSchema } from "#shared/services/pageBuilder/email/emailNodeSchema";
import { emailRegistry } from "#shared/services/pageBuilder/email/emailRegistry";
import { describe, expect, test } from "vitest";

describe("emailRegistry", () => {
  test("a registry's slot lists match the node schema's accepted types", () => {
    expect.hasAssertions();

    // A child of no registered type is refused at its type by the slot's union, which names the types that slot accepts
    const UNREGISTERED_TYPE = "unregistered";
    for (const definition of emailRegistry.types)
      for (const [slot, types] of Object.entries(definition.slots)) {
        const id = crypto.randomUUID();
        const result = emailNodeSchema.safeParse({
          props: { id, [slot]: [{ props: { id: crypto.randomUUID() }, type: UNREGISTERED_TYPE }] },
          type: definition.type,
        });

        expect(result.error?.issues.map(({ message, path }) => ({ message, path }))).toStrictEqual([
          { message: `type must be one of ${types.toSorted().join(", ")}`, path: ["props", slot, 0, "type"] },
        ]);
      }
  });
});
