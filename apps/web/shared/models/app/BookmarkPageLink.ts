import { pageLinkSchema } from "#shared/models/app/PageLink";
import { z } from "zod";

// A bookmark as the dock draws it: a page link, and whether the page it names can still be reached. One that cannot is
// Kept, drawn unavailable and offered for removal, since a failed visit never takes a bookmark away on its own
const bookmarkPageLinkSchema = pageLinkSchema.safeExtend({ isAvailable: z.boolean() });
export type BookmarkPageLink = z.infer<typeof bookmarkPageLinkSchema>;
