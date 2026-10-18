import type { WikiAdvancedProperty } from "#src/models/genshinAssets/kits/wiki/WikiAdvancedProperty";

const TEMPLATE_START = "{{Advanced Properties";
const PARAMETER_REGEX = /^(?<field>[a-z]+?)(?<row>\d*)$/u;
const GAUGE_REGEX = /^(?<units>\d+(?:\.\d+)?)U$/u;
const NUMBER_REGEX = /^\d+(?:\.\d+)?$/u;

// The template's text from its opening braces to its closing ones, nested templates and all
const readTemplateBody = (wikitext: string, start: number): string => {
  let depth = 0;
  for (let index = start; index < wikitext.length - 1; index++) {
    const pair = wikitext.slice(index, index + 2);
    if (pair === "{{") {
      depth++;
      index++;
    } else if (pair === "}}") {
      depth--;
      index++;
      if (depth === 0) return wikitext.slice(start + 2, index - 1);
    }
  }
  return wikitext.slice(start + 2);
};

// The rows of every `{{Advanced Properties}}` template on a wiki talent page, numbered on from one template to the
// Next: each row's `titleN`, `guN`, `icdtagN` and `poiseN`, the first row's written with no number
export const parseAdvancedProperties = (wikitext: string): WikiAdvancedProperty[] => {
  const properties: WikiAdvancedProperty[] = [];
  let rowOffset = 0;
  for (
    let start = wikitext.indexOf(TEMPLATE_START);
    start !== -1;
    start = wikitext.indexOf(TEMPLATE_START, start + 1)
  ) {
    const fieldMaps = new Map<number, Map<string, string>>();
    for (const parameter of readTemplateBody(wikitext, start).split("\n|").slice(1)) {
      const separator = parameter.indexOf("=");
      if (separator === -1) continue;
      const groups = PARAMETER_REGEX.exec(parameter.slice(0, separator).trim())?.groups;
      if (groups?.field === undefined) continue;
      const row = groups.row === undefined || groups.row === "" ? 1 : Number(groups.row);
      const fieldMap = fieldMaps.get(row) ?? new Map<string, string>();
      fieldMap.set(groups.field, parameter.slice(separator + 1).trim());
      fieldMaps.set(row, fieldMap);
    }
    for (const [row, fieldMap] of [...fieldMaps].toSorted(([left], [right]) => left - right)) {
      const title = fieldMap.get("title");
      if (title === undefined) continue;
      const gauge = GAUGE_REGEX.exec(fieldMap.get("gu") ?? "")?.groups?.units;
      const poise = fieldMap.get("poise") ?? "";
      const internalCooldownTag = fieldMap.get("icdtag");
      properties.push({
        ...(gauge !== undefined && { gauge: Number(gauge) }),
        ...(internalCooldownTag !== undefined && internalCooldownTag !== "" && { internalCooldownTag }),
        ...(NUMBER_REGEX.test(poise) && { poise: Number(poise) }),
        row: rowOffset + row,
        title,
      });
    }
    // The next template goes on from this one's last row, whether or not that row has a title
    rowOffset += Math.max(0, ...fieldMaps.keys());
  }
  return properties;
};
