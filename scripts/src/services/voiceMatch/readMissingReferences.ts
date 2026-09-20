import { MAX_WIKI_TITLES_PER_QUERY } from "#src/services/voiceMatch/constants";
import { VoiceLanguage } from "@esposter/genshin-persona/src/models/VoiceLanguage.ts";
import { getWikiFileTitle } from "@esposter/genshin-persona/src/services/getWikiFileTitle.ts";
import { readWikiFileUrls } from "@esposter/genshin-persona/src/services/readWikiFileUrls.ts";

// Every character's reference stem, asked of the wiki in every dub: a stem was measured in one dub and serves the
// Others by the template's rule, and a line the wiki renamed or never dubbed is a character the plugin would
// Fall silent on. One title per character and dub, batched as the API takes them
export const readMissingReferences = async (stems: Map<string, string>): Promise<string[]> => {
  const titles = new Map<string, string>();
  for (const language of Object.values(VoiceLanguage))
    for (const [name, stem] of stems) titles.set(getWikiFileTitle(stem, language), `${name} (${language})`);
  const titleList = [...titles.keys()];
  const missing: string[] = [];
  for (let start = 0; start < titleList.length; start += MAX_WIKI_TITLES_PER_QUERY) {
    const batch = titleList.slice(start, start + MAX_WIKI_TITLES_PER_QUERY);
    const urls = await readWikiFileUrls(batch);
    for (const title of batch) if (!urls.has(title)) missing.push(`${titles.get(title)}: ${title}`);
  }

  return missing;
};
