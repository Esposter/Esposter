import type { LineNumberCitation } from "#src/models/citations/LineNumberCitation";

import { checkIsExternalFile } from "#src/services/citations/checkIsExternalFile";
import { getCitedFile } from "#src/services/citations/getCitedFile";
import { FENCE_REGEX } from "#src/services/openspec/constants";

const URL_REGEX = /https?:\/\/\S+/gu;
// A colon citation names its file: `path.ts:44-47`, `path.ts:4,24`, or `path.ts`:44-47 with the backtick closed first
const COLON_CITATION_REGEX =
  /(?<path>[^\s`'"()[\]<>,;:|]*?\.[A-Za-z][\dA-Za-z]*)`?:(?<line>\d+(?:-\d+)?(?:,\s?\d+(?:-\d+)?)*)(?!\w)/gu;
// A shorthand line names none, so the file is the one its sentence names before it: `path.ts:10`, `:11`
const SHORTHAND_CITATION_REGEX = /`(?<line>:\d+(?:-\d+)?(?:,\s?\d+(?:-\d+)?)*)`/gu;
// A measure a count of lines can carry in prose, `lines 32 units apart`, is a size and not a line of a file
const MEASURE_PATTERN =
  "units?|px|pixels?|metres?|m|ms|pt|em|cm|mm|%|frames?|seconds?|times|items?|rows?|tiles?|cells?|degrees?";
const LINE_LOCATOR_REGEX = new RegExp(
  `\\blines? (?<locator>\\d+(?!\\d)(?!\\.\\d)(?!\\s?(?:${MEASURE_PATTERN})(?!\\w))(?:(?:-|\\u2013|,| and | or | to | through )\\s?\\d+(?!\\d)(?!\\.\\d))*)`,
  "giu",
);

// Every citation on a line, with the file it names, or none where the sentence names none
const getLineCitations = (line: string) => [
  ...Array.from(line.matchAll(COLON_CITATION_REGEX), ({ 0: match, groups, index }) => ({
    file: groups?.path,
    index,
    text: match.replaceAll("`", ""),
  })),
  ...Array.from(line.matchAll(SHORTHAND_CITATION_REGEX), ({ 0: match, groups, index }) => ({
    file: getCitedFile(line, index, index + match.length),
    index,
    text: groups?.line ?? "",
  })),
  ...Array.from(line.matchAll(LINE_LOCATOR_REGEX), ({ 0: text, index }) => ({
    file: getCitedFile(line, index, index + text.length),
    index,
    text,
  })),
];

// The line-number citations of a page of markdown that name a file of the repository, in reading order. A fenced block
// Is a program or a log rather than a citation, and a line the citation names by no file is one a reader cannot find
export const getLineNumberCitations = (markdown: string): LineNumberCitation[] => {
  let isInFence = false;
  return markdown.split(/\r?\n/u).flatMap((rawLine, lineIndex) => {
    if (FENCE_REGEX.test(rawLine)) {
      isInFence = !isInFence;
      return [];
    }
    if (isInFence) return [];

    return getLineCitations(rawLine.replaceAll(URL_REGEX, " "))
      .filter(({ file }) => file === undefined || !checkIsExternalFile(file))
      .toSorted((a, b) => a.index - b.index)
      .map(({ text }) => ({ line: lineIndex + 1, text }));
  });
};
