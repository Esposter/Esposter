import type { WikiStoryLine } from "#src/models/WikiStoryLine";

import { getPlainLineText } from "#src/services/getPlainLineText";
import { getWikiFileStem } from "#src/services/getWikiFileStem";
import { parseWikiTemplateLines } from "#src/services/parseWikiTemplateLines";
import { sliceWikiTemplate } from "#src/services/sliceWikiTemplate";

// The story template holds the lines a reply is spoken in the register of; the combat template after it is left
// Out, and a page without one lists no lines
const STORY_TEMPLATE_START = "{{VO/Story";
const FILE_FIELD = "file";
const CHARACTER_REGEX = /\|character\s*=\s*(?<character>.*)/u;
// The template's own placeholder, which every title and file name carry the character's name through
const CHARACTER_PLACEHOLDER = "{character}";
// The Traditional Chinese script spells the second person by the player's gender through a choice template, on
// Nearly every line; the wiki shows the first form until told otherwise, and so does the spinner
const WORD_CHOICE_REGEX = /\{\{MC\|m=(?<male>[^|}]*)\|f=[^}]*\}\}/gu;
// Every story line the voice-over page lists, with the stem its clip is filed under: the source both the
// Reference selection measures over and the plugin fetches a reference from, and the spinner's lines in a
// Language the data package does not carry the character in yet
export const parseWikiStoryLines = (wikitext: string, fieldSuffix: string): WikiStoryLine[] => {
  const template = sliceWikiTemplate(wikitext, STORY_TEMPLATE_START);
  const character = CHARACTER_REGEX.exec(template)?.groups?.character?.trim() ?? "";
  return parseWikiTemplateLines(template, FILE_FIELD, fieldSuffix)
    .map(({ file, text, title }) => ({
      stem: getWikiFileStem(file, CHARACTER_PLACEHOLDER, character),
      text: getPlainLineText(text.replaceAll(WORD_CHOICE_REGEX, "$<male>")),
      title: title.replaceAll(CHARACTER_PLACEHOLDER, character).trim(),
    }))
    .filter(({ stem, title }) => stem && title);
};
