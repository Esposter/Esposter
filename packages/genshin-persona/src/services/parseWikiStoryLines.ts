import type { WikiStoryLine } from "#src/models/WikiStoryLine";

import { WIKI_VOICE_FILE_EXTENSION, WIKI_VOICE_FILE_PREFIX } from "#src/services/constants";
import { getPlainLineText } from "#src/services/getPlainLineText";

// The story template holds the lines a reply is spoken in the register of; the combat template after it is left
// Out, and a page without one lists no lines
const STORY_TEMPLATE_START = "{{VO/Story";
const TEMPLATE_END = "\n}}";
const CHARACTER_REGEX = /\|character\s*=\s*(?<character>.*)/u;
const WIKI_TITLE_REGEX = /\|vo_(?<id>\d+_\d+)_title\s*=\s*(?<title>.*)/gu;
const WIKI_FILE_REGEX = /\|vo_(?<id>\d+_\d+)_file\s*=\s*(?<file>.*)/gu;
const WIKI_TEXT_REGEX = /\|vo_(?<id>\d+_\d+)_tx\s*=\s*(?<text>[\s\S]*?)(?=\n\|vo_|\n<!--|\n\}\}|$)/gu;
// The template's own placeholders, which every title and file name carry the character's name through
const CHARACTER_PLACEHOLDER = "{character}";
const LANGUAGE_PLACEHOLDER = "{language}";
const readEntries = (template: string, regex: RegExp, group: string) =>
  new Map(Array.from(template.matchAll(regex), (match) => [match.groups?.id ?? "", match.groups?.[group] ?? ""]));

// A line's file name as the template writes it is the prefix, the dub's placeholder, the character's name and the
// Title; what is kept is the part every dub shares
const getStem = (file: string, character: string) =>
  file
    .replace(`${WIKI_VOICE_FILE_PREFIX}${LANGUAGE_PLACEHOLDER}`, "")
    .replace(WIKI_VOICE_FILE_EXTENSION, "")
    .replaceAll(CHARACTER_PLACEHOLDER, character)
    .trim();

// Every story line the voice-over page lists, with the stem its clip is filed under: the source both the
// Reference selection measures over and the plugin fetches a reference from
export const parseWikiStoryLines = (wikitext: string): WikiStoryLine[] => {
  const start = wikitext.indexOf(STORY_TEMPLATE_START);
  if (start === -1) return [];

  const end = wikitext.indexOf(TEMPLATE_END, start);
  const template = wikitext.slice(start, end === -1 ? undefined : end);
  const character = CHARACTER_REGEX.exec(template)?.groups?.character?.trim() ?? "";
  const titles = readEntries(template, WIKI_TITLE_REGEX, "title");
  const files = readEntries(template, WIKI_FILE_REGEX, "file");
  return Array.from(readEntries(template, WIKI_TEXT_REGEX, "text"), ([id, text]) => ({
    stem: getStem(files.get(id) ?? "", character),
    text: getPlainLineText(text),
    title: (titles.get(id) ?? "").replaceAll(CHARACTER_PLACEHOLDER, character).trim(),
  })).filter(({ stem, title }) => stem && title);
};
