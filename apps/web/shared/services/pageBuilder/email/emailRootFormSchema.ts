import { mjmlRootPropsSchema } from "mjml-blocks";
import { z } from "zod";

// The settings the Settings panel edits over the email's head and body: its language, direction, title, font list, and
// The body's width and background. Each is the stored root prop's own schema, so the panel refuses what the document
// Would refuse. The title is the document title a mail client shows, not the subject line, and the label says so
export const emailRootFormSchema = mjmlRootPropsSchema
  .pick({ direction: true, fonts: true, lang: true })
  .extend({
    body: z.object({
      "background-color": z.string().meta({ title: "Body background colour" }),
      width: z.string().meta({ title: "Body width" }),
    }),
    title: mjmlRootPropsSchema.shape.title.meta({ title: "Document title, not the subject" }),
  });
