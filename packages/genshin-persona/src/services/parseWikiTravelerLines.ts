import type { TravelerTwin } from "#src/models/TravelerTwin";
import type { WikiStoryLine } from "#src/models/WikiStoryLine";

import { getPlainLineText } from "#src/services/getPlainLineText";
import { getWikiFileStem } from "#src/services/getWikiFileStem";
import { parseWikiTemplateLines } from "#src/services/parseWikiTemplateLines";
import { sliceWikiTemplate } from "#src/services/sliceWikiTemplate";

// The Traveler's story template names a file per twin for every line, and every line is a dialogue with Paimon:
// The turns are separated by a line break, each opens with its speaker in bold, and a word the twins say
// Differently is a choice template with his word first and hers second — named as the twins are told apart, so
// The twin's word is the replacement
const TRAVELER_TEMPLATE_START = "{{VO/Traveler";
const FILE_FIELD_PREFIX = "file_";
const TURN_SEPARATOR = "<br>";
const TRAVELER_SPEAKER = "'''{{Traveler}}:'''";
const WORD_CHOICE_REGEX = /\{\{MC\|(?<male>[^|}]*)\|(?<female>[^|}]*)[^}]*\}\}/gu;

// Every line of one twin the Traveler's story page lists that the twin opens — the clip is theirs only until
// Paimon answers, so the text is their opening turn, which is what their reference is cut to
export const parseWikiTravelerLines = (
  wikitext: string,
  name: string,
  { gender, namePlaceholder }: TravelerTwin,
): WikiStoryLine[] => {
  const template = sliceWikiTemplate(wikitext, TRAVELER_TEMPLATE_START);
  return parseWikiTemplateLines(template, `${FILE_FIELD_PREFIX}${gender}`).flatMap<WikiStoryLine>(
    ({ file, text, title }) => {
      const [openingTurn = ""] = text.split(TURN_SEPARATOR);
      const turn = openingTurn.trim();
      if (!turn.startsWith(TRAVELER_SPEAKER)) return [];

      const stem = getWikiFileStem(file, namePlaceholder, name);
      const words = turn.slice(TRAVELER_SPEAKER.length).replaceAll(WORD_CHOICE_REGEX, `$<${gender}>`);
      return stem && title ? [{ stem, text: getPlainLineText(words), title: title.trim() }] : [];
    },
  );
};
