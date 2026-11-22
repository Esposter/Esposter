import type { WikiImaginariumStage } from "#src/models/genshinAssets/imaginarium/WikiImaginariumStage";

// A member of a domain enemies line, as the wiki writes it: its name, then a count, an aura or a Lua table annotation, which
// The name ends before. The count is not read, since the stage's enemies are named, not counted
const cleanWikiEnemyName = (member: string): string => member.replace(/[*/{].*$/u, "").trim();
// The stages of a season's wiki page: each domain enemies block's variants, under the act and battle the block sits in. Its
// Enemies are the names of its members in order, split at a semicolon and at the double slash that starts a second wave
export const parseWikiImaginariumStages = (page: string): WikiImaginariumStage[] => {
  const stages: WikiImaginariumStage[] = [];
  let act = "";
  let battle = "";
  let variants: Map<number, { enemies: string; level: string }> | undefined;
  for (const line of page.split("\n")) {
    if (variants === undefined) {
      const actHeading = /^===(?<act>[^=].*?)===\s*$/u.exec(line);
      if (actHeading?.groups !== undefined) act = actHeading.groups.act?.trim() ?? "";
      const battleLine = /^;Battle\{\{colon\}\}\s*(?<battle>.+)$/iu.exec(line);
      if (battleLine?.groups !== undefined) battle = battleLine.groups.battle?.trim() ?? "";
      if (line.startsWith("{{Domain Enemies")) variants = new Map();
      continue;
    }
    if (line === "}}") {
      for (const [variant, { enemies, level }] of variants) {
        // A variant the wiki gives no Easy Mode level is not an Easy stage, so it is left out
        const easyLevel = /Easy Mode:\s*(?<easyLevel>\d+)/u.exec(level)?.groups?.easyLevel;
        if (easyLevel !== undefined)
          stages.push({
            act,
            battle,
            easyLevel: Number(easyLevel),
            enemyNames: enemies
              .split(/\/\/|;/u)
              .map((member) => cleanWikiEnemyName(member))
              .filter((name) => name !== ""),
            variant,
          });
      }
      variants = undefined;
      continue;
    }
    const enemiesLine = /^\|enemies(?<variant>\d+)\s*=\s*(?<enemies>.*)$/u.exec(line);
    const levelLine = /^\|level(?<variant>\d+)\s*=\s*(?<level>.*)$/u.exec(line);
    const block = variants;
    if (enemiesLine?.groups !== undefined) {
      const variant = Number(enemiesLine.groups.variant);
      block.set(variant, { enemies: enemiesLine.groups.enemies ?? "", level: block.get(variant)?.level ?? "" });
    } else if (levelLine?.groups !== undefined) {
      const variant = Number(levelLine.groups.variant);
      block.set(variant, { enemies: block.get(variant)?.enemies ?? "", level: levelLine.groups.level ?? "" });
    }
  }
  return stages;
};
