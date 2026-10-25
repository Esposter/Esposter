import { MjmlDirection } from "#src/models/MjmlDirection";
import {
  MJML_CONTENT_MAX_LENGTH,
  MJML_NAME_MAX_LENGTH,
  MJML_ROOT_LIST_MAX_LENGTH,
  MJML_VALUE_MAX_LENGTH,
} from "#src/services/constants";
import { z } from "zod";

// A root name and value are bounded alike, so each string the head and body write is held to a length
const rootName = z.string().max(MJML_NAME_MAX_LENGTH);
const rootValue = z.string().max(MJML_VALUE_MAX_LENGTH);

// The shape alone: the document schema adds each attribute's grammar and each address's scheme check to it
export const mjmlRootPropsSchema: z.ZodObject<
  {
    attributes: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodRecord<z.ZodString, z.ZodString>>>;
    body: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    breakpoint: z.ZodOptional<z.ZodObject<{ width: z.ZodString }, z.core.$strict>>;
    direction: z.ZodOptional<z.ZodEnum<typeof MjmlDirection>>;
    fonts: z.ZodOptional<z.ZodArray<z.ZodObject<{ href: z.ZodString; name: z.ZodString }, z.core.$strict>>>;
    lang: z.ZodOptional<z.ZodString>;
    preview: z.ZodOptional<z.ZodString>;
    styles: z.ZodOptional<z.ZodArray<z.ZodObject<{ css: z.ZodString; inline: z.ZodBoolean }, z.core.$strict>>>;
    title: z.ZodOptional<z.ZodString>;
  },
  z.core.$strict
> = z.strictObject({
  attributes: z.record(rootName, z.record(rootName, rootValue)).optional(),
  body: z.record(rootName, rootValue).optional(),
  breakpoint: z.strictObject({ width: rootValue }).optional(),
  direction: z.enum(MjmlDirection).optional(),
  fonts: z
    .array(z.strictObject({ href: rootValue, name: rootName }))
    .max(MJML_ROOT_LIST_MAX_LENGTH)
    .optional(),
  lang: rootName.optional(),
  preview: rootValue.optional(),
  styles: z
    .array(
      z.strictObject({
        css: z
          .string()
          .max(MJML_CONTENT_MAX_LENGTH)
          .refine((css) => !css.includes("<"), { error: "holds a < that could close its element" }),
        inline: z.boolean(),
      }),
    )
    .max(MJML_ROOT_LIST_MAX_LENGTH)
    .optional(),
  title: rootValue.optional(),
});
// The document's head and body: what MJML writes outside the email's sections, each value as the author set it. Its type is
// Inferred, since an inferred object type takes the implicit index signature the core's root props need
export type MjmlRootProps = z.infer<typeof mjmlRootPropsSchema>;
