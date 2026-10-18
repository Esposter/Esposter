import { MjmlDirection } from "#src/models/MjmlDirection";
import { z } from "zod";

// The document's head and body: what MJML writes outside the email's sections, each value as the author set it
export interface MjmlRootProps {
  attributes?: Record<string, Record<string, string>>;
  body?: Record<string, string>;
  breakpoint?: { width: string };
  dir?: MjmlDirection;
  fonts?: { href: string; name: string }[];
  lang?: string;
  preview?: string;
  styles?: { css: string; inline: boolean }[];
  title?: string;
}

// The shape alone: the document schema adds each attribute's grammar and each address's scheme check to it
export const mjmlRootPropsSchema: z.ZodObject<
  {
    attributes: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodRecord<z.ZodString, z.ZodString>>>;
    body: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodString>>;
    breakpoint: z.ZodOptional<z.ZodObject<{ width: z.ZodString }, z.core.$strict>>;
    dir: z.ZodOptional<z.ZodEnum<typeof MjmlDirection>>;
    fonts: z.ZodOptional<z.ZodArray<z.ZodObject<{ href: z.ZodString; name: z.ZodString }, z.core.$strict>>>;
    lang: z.ZodOptional<z.ZodString>;
    preview: z.ZodOptional<z.ZodString>;
    styles: z.ZodOptional<z.ZodArray<z.ZodObject<{ css: z.ZodString; inline: z.ZodBoolean }, z.core.$strict>>>;
    title: z.ZodOptional<z.ZodString>;
  },
  z.core.$strict
> = z.strictObject({
  attributes: z.record(z.string(), z.record(z.string(), z.string())).optional(),
  body: z.record(z.string(), z.string()).optional(),
  breakpoint: z.strictObject({ width: z.string() }).optional(),
  dir: z.enum(MjmlDirection).optional(),
  fonts: z.array(z.strictObject({ href: z.string(), name: z.string() })).optional(),
  lang: z.string().optional(),
  preview: z.string().optional(),
  styles: z
    .array(
      z.strictObject({
        css: z.string().refine((css) => !css.includes("<"), "holds a < that could close its element"),
        inline: z.boolean(),
      }),
    )
    .optional(),
  title: z.string().optional(),
});
