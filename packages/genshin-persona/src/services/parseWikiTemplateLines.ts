import type { WikiTemplateLine } from "#src/models/WikiTemplateLine";

const readEntries = (template: string, regex: RegExp, group: string) =>
  new Map(Array.from(template.matchAll(regex), (match) => [match.groups?.id ?? "", match.groups?.[group] ?? ""]));
// Every line the template lists under one file field, as the template writes it — the placeholders every title
// And file name carry a name through are the caller's to fill, since each template spells them its own way
const TITLE_REGEX = /\|vo_(?<id>\d+_\d+)_title\s*=\s*(?<title>.*)/gu;
const TEXT_REGEX = /\|vo_(?<id>\d+_\d+)_tx\s*=\s*(?<text>[\s\S]*?)(?=\n\|vo_|\n<!--|\n\}\}|$)/gu;
export const parseWikiTemplateLines = (template: string, fileField: string): WikiTemplateLine[] => {
  const fileRegex = new RegExp(String.raw`\|vo_(?<id>\d+_\d+)_${fileField}\s*=\s*(?<file>.*)`, "gu");
  const titles = readEntries(template, TITLE_REGEX, "title");
  const files = readEntries(template, fileRegex, "file");
  return Array.from(readEntries(template, TEXT_REGEX, "text"), ([id, text]) => ({
    file: files.get(id) ?? "",
    text,
    title: titles.get(id) ?? "",
  }));
};
