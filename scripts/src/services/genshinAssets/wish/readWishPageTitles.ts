import { WIKI_API_URL } from "#src/services/genshinAssets/kits/constants";
import { WISH_CATEGORY, WISH_CATEGORY_LIMIT } from "#src/services/genshinAssets/wish/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { readWikiJson } from "genshin-persona/src/services/readWikiJson.ts";
import { z } from "zod";

const categoryMembersSchema = z.object({
  continue: z.unknown().optional(),
  query: z.object({ categorymembers: z.array(z.object({ title: z.string() })) }),
});

// The title of every page the wish category holds, in the category's own order, read in one request
export const readWishPageTitles = async (): Promise<string[]> => {
  const searchParams = new URLSearchParams({
    action: "query",
    cmlimit: String(WISH_CATEGORY_LIMIT),
    cmtitle: WISH_CATEGORY,
    format: "json",
    formatversion: "2",
    list: "categorymembers",
  });
  const { continue: continuation, query } = categoryMembersSchema.parse(
    await readWikiJson<unknown>(`${WIKI_API_URL}?${searchParams.toString()}`),
  );
  if (continuation !== undefined)
    throw new InvalidOperationError(
      Operation.Read,
      WISH_CATEGORY,
      `holds more than ${String(WISH_CATEGORY_LIMIT)} pages`,
    );

  return query.categorymembers.map(({ title }) => title);
};
