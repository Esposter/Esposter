import { pageMarkSchema } from "#shared/models/app/PageMark";
import { z } from "zod";

// A page of the app as the dock shows it: where it is, what it is called, and the mark it was last visited with
export const pageLinkSchema = z.object({ mark: pageMarkSchema.optional(), path: z.string(), title: z.string() });
export type PageLink = z.infer<typeof pageLinkSchema>;
