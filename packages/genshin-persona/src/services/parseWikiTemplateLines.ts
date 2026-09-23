import type { WikiTemplateLine } from "#src/models/WikiTemplateLine";

const readEntries = (template: string, regex: RegExp, group: string) =>
  new Map(Array.from(template.matchAll(regex), (match) => [match.groups?.id ?? "", match.groups?.[group] ?? ""]));
// Every line the template lists under one file field, as the template writes it — the placeholders every title
// And file name carry a name through are the caller's to fill, since each template spells them its own way. The
// Field suffix is what a page carrying two scripts keys each script's title and text by; the file is shared
export const parseWikiTemplateLines = (
  template: string,
  fileField: string,
  fieldSuffix: string,
): WikiTemplateLine[] => {
  const titleRegex = new RegExp(String.raw`\|vo_(?<id>\d+_\d+)_title${fieldSuffix}\s*=\s*(?<title>.*)`, "gu");
  const textRegex = new RegExp(
    String.raw`\|vo_(?<id>\d+_\d+)_tx${fieldSuffix}\s*=\s*(?<text>[\s\S]*?)(?=\n\|vo_|\n<!--|\n\}\}|$)`,
    "gu",
  );
  const fileRegex = new RegExp(String.raw`\|vo_(?<id>\d+_\d+)_${fileField}\s*=\s*(?<file>.*)`, "gu");
  const titles = readEntries(template, titleRegex, "title");
  const files = readEntries(template, fileRegex, "file");
  return Array.from(readEntries(template, textRegex, "text"), ([id, text]) => ({
    file: files.get(id) ?? "",
    text,
    title: titles.get(id) ?? "",
  }));
};
