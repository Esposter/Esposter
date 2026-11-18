import { toWikiPageCachePath } from "#src/services/genshinAssets/enemies/toWikiPageCachePath";
import { writeFile } from "node:fs/promises";
import { describe } from "vitest";

// Writes a page into the wiki cache with the given main-slot text, in the shape the wiki's API answers with
export const writeWikiPage = (cacheDirectory: string, title: string, content: string): Promise<void> =>
  writeFile(
    toWikiPageCachePath(cacheDirectory, title),
    JSON.stringify({ query: { pages: [{ revisions: [{ slots: { main: { content } } }], title }] } }),
  );

describe.todo("writeWikiPage");
