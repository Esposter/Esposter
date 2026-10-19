import type { GcsimTalentParameter } from "#src/models/genshinAssets/kits/gcsim/GcsimTalentParameter";

const TALENT_COMMENT_REGEX = /\/\/ (?<type>attack|burst|skill): .+? - (?<label>.+): (?<formula>[^:]*\{\d+\}[^:]*)$/u;
const PARAMETER_REGEX = /\{(?<index>\d+)\}/gu;

// The labels gcsim's generated talent file names beside its multipliers, `// attack: DoughFu - 3-Hit DMG: {2}+{2}`, by
// `<talent>|<label>`: the game's parameter indexes each label reads, in order, each with the line citing it
export const readGcsimTalentParameters = (source: string): Map<string, GcsimTalentParameter> => {
  const talentRowMap = new Map<string, { indexes: number[]; lines: [number, ...number[]] }>();
  for (const [lineIndex, line] of source.split("\n").entries()) {
    const groups = TALENT_COMMENT_REGEX.exec(line.trim())?.groups;
    if (groups?.type === undefined || groups.label === undefined || groups.formula === undefined) continue;
    const key = `${groups.type}|${groups.label}`;
    const lineNumber = lineIndex + 1;
    const row = talentRowMap.get(key);
    if (row === undefined)
      talentRowMap.set(key, {
        indexes: Array.from(groups.formula.matchAll(PARAMETER_REGEX), (match) => Number(match.groups?.index)),
        lines: [lineNumber],
      });
    else row.lines.push(lineNumber);
  }
  const talentParameterMap = new Map<string, GcsimTalentParameter>();
  for (const [key, { indexes, lines }] of talentRowMap)
    talentParameterMap.set(key, {
      parameters: indexes.map((index, parameterIndex) => ({ index, line: lines[parameterIndex] ?? lines[0] })),
    });
  return talentParameterMap;
};
