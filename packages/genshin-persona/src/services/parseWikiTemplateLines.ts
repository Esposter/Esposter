import type { WikiTemplateLine } from "#src/models/WikiTemplateLine";

const TITLE_REGEX = /\|vo_(?<id>\d+_\d+)_title\s*=\s*(?<title>.*)/gu;
const TEXT_REGEX = /\|vo_(?<id>\d+_\d+)_tx\s*=\s*(?<text>[\s\S]*?)(?=\n\|vo_|\n<!--|\n\}\}|$)/gu;
// One field of every line, by the line's id
const getIdEntryMap = (template: string, regex: RegExp, group: string) =>
  new Map(Array.from(template.matchAll(regex), (match) => [match.groups?.id ?? "", match.groups?.[group] ?? ""]));
// Every line the template lists under one file field, as the template writes it — the placeholders every title
// And file name carry a name through are the caller's to fill, since each template spells them its own way
export const parseWikiTemplateLines = (template: string, fileField: string): WikiTemplateLine[] => {
  const fileRegex = new RegExp(String.raw`\|vo_(?<id>\d+_\d+)_${fileField}\s*=\s*(?<file>.*)`, "gu");
  const idTitleMap = getIdEntryMap(template, TITLE_REGEX, "title");
  const idFileMap = getIdEntryMap(template, fileRegex, "file");
  return Array.from(getIdEntryMap(template, TEXT_REGEX, "text"), ([id, text]) => ({
    file: idFileMap.get(id) ?? "",
    text,
    title: idTitleMap.get(id) ?? "",
  }));
};
