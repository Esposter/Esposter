import type { MjmlAttributeField } from "#src/models/MjmlAttributeField";
import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";

import { parseMjmlAttributeType } from "#src/services/parseMjmlAttributeType";

// The editor's fields for a type: one per attribute it takes, by name, with the default MJML sets for it
export const getMjmlAttributeFields = (
  definition: Pick<MjmlBlockTypeDefinition, "allowedAttributes" | "defaultAttributes">,
): MjmlAttributeField[] =>
  Object.entries(definition.allowedAttributes)
    .toSorted(([left], [right]) => (left < right ? -1 : 1))
    .map(([name, grammar]) => ({
      defaultValue: definition.defaultAttributes[name],
      name,
      type: parseMjmlAttributeType(grammar),
    }));
