import type { GcsimTalentParameter } from "#src/models/genshinAssets/kits/gcsim/GcsimTalentParameter";

const TALENT_COMMENT_REGEX = /\/\/ (?<type>attack|burst|skill): .+? - (?<label>.+): (?<formula>[^:]*\{\d+\}[^:]*)$/u;
const PARAMETER_REGEX = /\{(?<index>\d+)\}/gu;

// The labels gcsim's generated talent file names beside its multipliers, `// attack: DoughFu - 3-Hit DMG: {2}+{2}`, by
// `<talent>|<label>`: the game's parameter indexes each label reads, in order, and the line naming it first
export const readGcsimTalentParameters = (source: string): Map<string, GcsimTalentParameter> => {
  const talentParameterMap = new Map<string, GcsimTalentParameter>();
  for (const [lineIndex, line] of source.split("\n").entries()) {
    const groups = TALENT_COMMENT_REGEX.exec(line.trim())?.groups;
    if (groups?.type === undefined || groups.label === undefined || groups.formula === undefined) continue;
    const key = `${groups.type}|${groups.label}`;
    if (talentParameterMap.has(key)) continue;
    talentParameterMap.set(key, {
      indexes: Array.from(groups.formula.matchAll(PARAMETER_REGEX), (match) => Number(match.groups?.index)),
      line: lineIndex + 1,
    });
  }
  return talentParameterMap;
};
