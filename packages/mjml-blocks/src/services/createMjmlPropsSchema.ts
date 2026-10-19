import type { MjmlComponentSpecification } from "#src/models/MjmlComponentSpecification";
import type { MjmlRichTextDefinition } from "#src/models/MjmlRichTextDefinition";

import { MjmlContentKind } from "#src/models/MjmlContentKind";
import { createMjmlAttributeSchema } from "#src/services/createMjmlAttributeSchema";
import { exhaustiveGuard, sanitizeHtml } from "@esposter/shared";
import { z } from "zod";

// A node's props: its content by kind, its alternative text flag and each attribute it sets
// Its id and its children are the branch's own, a slot's nodes, so the schema leaves both out
export const createMjmlPropsSchema = <TContent>(
  specification: MjmlComponentSpecification,
  richText: MjmlRichTextDefinition<TContent>,
): z.ZodObject => {
  const shape: Record<string, z.ZodType> = {};

  switch (specification.contentKind) {
    case MjmlContentKind.Label:
      shape.content = z.string();
      break;
    case MjmlContentKind.Raw:
      shape.content = z
        .string()
        .refine((html) => sanitizeHtml(html) === html, { error: "holds HTML the sanitiser would change" });
      break;
    case MjmlContentKind.RichText:
      shape.content = richText.schema;
      break;
    case undefined:
      break;
    default:
      exhaustiveGuard(specification.contentKind);
  }

  for (const [name, grammar] of Object.entries(specification.allowedAttributes))
    shape[name] = createMjmlAttributeSchema(grammar, name).optional();

  if (!specification.hasAlternativeText) return z.strictObject(shape);

  shape.decorative = z.boolean().optional();
  return z.strictObject(shape).superRefine((props, context) => {
    if (!(props.alt || props.decorative))
      context.addIssue({ code: "custom", message: "needs an alternative text or to be decorative", path: ["alt"] });
  });
};
