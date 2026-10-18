import type { GcsimTalentArray } from "#src/models/genshinAssets/kits/gcsim/GcsimTalentArray";

const DECLARATION_REGEX = /^\s*(?<name>\w+) = (?:\[\])+float64\{/u;
const NUMBER_REGEX = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/iu;
const TOKEN_REGEX = /[{}]|[^\s,{}]+/gu;

// The multiplier arrays of a talent file by their variable name, each read from its declaration to the brace
// That closes it: a row per innermost brace group that holds numbers, the comments beside them stripped, since
// They name braces too
export const readGcsimTalentArrays = (source: string): Map<string, GcsimTalentArray> => {
  const talentArrayMap = new Map<string, GcsimTalentArray>();
  const lines = source.split("\n");
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const name = DECLARATION_REGEX.exec(lines[lineIndex] ?? "")?.groups?.name;
    if (name === undefined) continue;
    const rows: number[][] = [];
    // The open braces, each with the numbers written directly inside it
    const openGroups: number[][] = [];
    let endIndex = lineIndex;
    for (; endIndex < lines.length; endIndex++) {
      const code = (lines[endIndex] ?? "").replace(/\/\/.*$/u, "");
      for (const token of code.match(TOKEN_REGEX) ?? []) {
        if (token === "{") openGroups.push([]);
        else if (token === "}") {
          const values = openGroups.pop() ?? [];
          if (values.length > 0) rows.push(values);
        } else if (NUMBER_REGEX.test(token)) openGroups.at(-1)?.push(Number(token));
      }
      if (openGroups.length === 0) break;
    }
    talentArrayMap.set(name, { line: lineIndex + 1, rows });
    lineIndex = endIndex;
  }
  return talentArrayMap;
};
