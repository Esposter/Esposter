import { MAX_WIKI_TITLES_PER_QUERY } from "#src/services/voiceMatch/constants";
import { VoiceLanguage } from "@esposter/genshin-persona/src/models/VoiceLanguage.ts";
import { getWikiFileTitle } from "@esposter/genshin-persona/src/services/getWikiFileTitle.ts";
import { readWikiFileUrls } from "@esposter/genshin-persona/src/services/readWikiFileUrls.ts";
import { chunk, takeOne } from "@esposter/shared";

// Every character's reference stem, asked of the wiki in every dub: a stem was measured in one dub and serves the
// Others by the template's rule, and a line the wiki renamed or never dubbed is a character the plugin would
// Fall silent on. One title per character and dub, batched as the API takes them
export const readMissingReferences = async (stems: Map<string, string>): Promise<string[]> => {
  const titles = new Map<string, string>();
  for (const language of Object.values(VoiceLanguage))
    for (const [name, stem] of stems) titles.set(getWikiFileTitle(stem, language), `${name} (${language})`);
  const titleList = [...titles.keys()];
  // The batches are independent requests, so they overlap
  const batches = chunk(titleList, MAX_WIKI_TITLES_PER_QUERY);
  const urlPages = await Promise.all(batches.map((batch) => readWikiFileUrls(batch)));
  return batches.flatMap((batch, index) =>
    batch.filter((title) => !takeOne(urlPages, index).has(title)).map((title) => `${titles.get(title)}: ${title}`),
  );
};
