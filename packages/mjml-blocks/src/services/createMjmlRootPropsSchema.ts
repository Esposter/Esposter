import type { MjmlBlockTypeDefinition } from "#src/models/MjmlBlockTypeDefinition";

import { allowedAddressSchema } from "#src/services/allowedAddressSchema";
import { checkMjmlAttributeValues } from "#src/services/checkMjmlAttributeValues";
import { ALL_ATTRIBUTES_KEY, MJML_BODY_ATTRIBUTES, MJML_BREAKPOINT_ATTRIBUTES } from "#src/services/constants";
import { getMjmlAttributeSchema } from "#src/services/getMjmlAttributeSchema";
import { mjmlRootPropsSchema } from "#src/services/mjmlRootPropsSchema";

// The document's head and body, checked against the definitions it may name: each per-type attribute map is one the type takes
export const createMjmlRootPropsSchema = (
  definitions: Pick<MjmlBlockTypeDefinition, "allowedAttributes" | "type">[],
): typeof mjmlRootPropsSchema =>
  mjmlRootPropsSchema.superRefine((props, context) => {
    checkMjmlAttributeValues(props.body ?? {}, MJML_BODY_ATTRIBUTES, ["body"], context);
    if (props.breakpoint)
      checkMjmlAttributeValues(props.breakpoint, MJML_BREAKPOINT_ATTRIBUTES, ["breakpoint"], context);

    for (const [index, font] of (props.fonts ?? []).entries()) {
      const result = allowedAddressSchema.safeParse(font.href);
      if (!result.success)
        for (const issue of result.error.issues)
          context.addIssue({ code: "custom", message: issue.message, path: ["fonts", index, "href"] });
    }

    for (const [type, values] of Object.entries(props.attributes ?? {})) {
      const segments = ["attributes", type];
      if (type === ALL_ATTRIBUTES_KEY) {
        // MJML writes a default for all components into every type that takes its name, and no type checks it there,
        // So a value is kept only when each of those types accepts it
        for (const [name, value] of Object.entries(values)) {
          const schemas = definitions
            .map((definition) => getMjmlAttributeSchema(definition.allowedAttributes, name))
            .filter((schema) => schema !== undefined);
          if (schemas.length === 0)
            context.addIssue({
              code: "custom",
              message: `"${name}" is not an attribute any type takes`,
              path: [...segments, name],
            });
          else if (!schemas.every((schema) => schema.safeParse(value).success))
            context.addIssue({
              code: "custom",
              message: `"${value}" is not a value every type that takes "${name}" accepts`,
              path: [...segments, name],
            });
        }

        continue;
      }

      const definition = definitions.find((candidate) => candidate.type === type);
      if (definition) checkMjmlAttributeValues(values, definition.allowedAttributes, segments, context);
      else context.addIssue({ code: "custom", message: `"${type}" is not in the registry`, path: segments });
    }
  });
