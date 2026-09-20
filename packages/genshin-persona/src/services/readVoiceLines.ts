import type { VoiceLine } from "#src/models/VoiceLine";
import type { WikiParseResponse } from "#src/models/WikiParseResponse";

import { WIKI_FETCH_TIMEOUT_MS, WIKI_USER_AGENT, WIKI_VOICE_OVERS_URL } from "#src/services/constants";
import { readGenshinDb } from "#src/services/readGenshinDb";

// Lines that carry no voice: how the character feels about others, the daily greetings, the gift and ascension
// Acknowledgements
const SKIPPED_TITLE_REGEX =
  /^(?:About |More About|Feelings About|Good (?:Morning|Afternoon|Evening|Night)|Receiving a Gift|Birthday|Ascension)/u;
const WHITESPACE_RUN_REGEX = /\s+/gu;
const WIKI_TITLE_REGEX = /\|vo_(?<id>\d+_\d+)_title\s*=\s*(?<title>.*)/gu;
const WIKI_TEXT_REGEX = /\|vo_(?<id>\d+_\d+)_tx\s*=\s*(?<text>[\s\S]*?)(?=\n\|vo_|\n<!--|\n\}\})/gu;
// Templates, tags and bold markers dropped, a link reduced to its label
const WIKI_MARKUP_REGEX = /\{\{[^}]*\}\}|<[^>]+>|'''/gu;
const WIKI_LINK_REGEX = /\[\[(?:[^\]|]*\|)?(?<label>[^\]]*)\]\]/gu;

const getVoiceLine = (title: string, text: string): VoiceLine => ({
  text: text
    .replaceAll(WIKI_MARKUP_REGEX, "")
    .replaceAll(WIKI_LINK_REGEX, "$<label>")
    .replaceAll("&mdash;", "—")
    .replaceAll(WHITESPACE_RUN_REGEX, " ")
    .trim(),
  title: title.trim(),
});

// A character the data has no lines for yet is usually on the wiki already, which parses its voice-over page on
// Request — one attempt with a short ceiling, and nothing of the page when it declines
const readWikiText = async (name: string): Promise<string | undefined> => {
  const response = await fetch(`${WIKI_VOICE_OVERS_URL}${encodeURIComponent(`${name}/Voice-Overs`)}`, {
    headers: { "user-agent": WIKI_USER_AGENT },
    signal: AbortSignal.timeout(WIKI_FETCH_TIMEOUT_MS),
  });
  if (!response.ok) return undefined;

  const { parse } = (await response.json()) as WikiParseResponse;
  return parse?.wikitext?.["*"] ?? "";
};

// Nothing rather than no lines when the wiki could not be reached, declined or answered with a body that is not
// The JSON its API promises — a settled promise is how each of those is read without a try — because a page with
// No lines on it and a page that never arrived print the same nothing otherwise
const readWikiLines = async (name: string): Promise<undefined | VoiceLine[]> => {
  const [result] = await Promise.allSettled([readWikiText(name)]);
  const wikitext = result?.status === "fulfilled" ? result.value : undefined;
  if (wikitext === undefined) return undefined;

  const titles = new Map<string, string>();
  for (const match of wikitext.matchAll(WIKI_TITLE_REGEX))
    titles.set(match.groups?.id ?? "", match.groups?.title ?? "");

  const lines: VoiceLine[] = [];
  for (const match of wikitext.matchAll(WIKI_TEXT_REGEX)) {
    const title = titles.get(match.groups?.id ?? "") ?? "";
    if (title && !SKIPPED_TITLE_REGEX.test(title)) lines.push(getVoiceLine(title, match.groups?.text ?? ""));
  }

  return lines;
};

export const readVoiceLines = (name: string): Promise<undefined | VoiceLine[]> => {
  const genshindb = readGenshinDb();
  const voiceovers = genshindb.voiceovers(name);
  const friendLines = voiceovers?.friendLines ?? [];
  if (friendLines.length === 0) return readWikiLines(name);

  const lines = friendLines
    .filter(({ title }) => !SKIPPED_TITLE_REGEX.test(title))
    .map(({ description, title }) => getVoiceLine(title, description));
  return Promise.resolve(lines);
};
