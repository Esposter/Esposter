import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";
import type { WikiAdvancedProperty } from "#src/models/genshinAssets/kits/wiki/WikiAdvancedProperty";
import type { WikiTalentPage } from "#src/models/genshinAssets/kits/wiki/WikiTalentPage";

import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { addKitCandidate } from "#src/services/genshinAssets/kits/candidates/addKitCandidate";
import { WikiInternalCooldownTagMap } from "#src/services/genshinAssets/kits/wiki/WikiInternalCooldownTagMap";
import { CombatTalent, InternalCooldownTag, KitPlunge, WeaponType } from "genshin-world";

const NORMAL_ATTACK_TITLE_REGEX = /^Normal Attack (?<strike>\d+)(?:-Hit)?(?: (?<hit>[A-Z]))?$/u;
const CHARGED_ATTACK_TITLE_REGEX =
  /^(?:Charged Attack(?: (?:(?<number>\d+)-Hit|(?<letter>[A-Z])))?|Fully-Charged Aimed Shot)$/u;
const HIT_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const WIKI_NO_INTERNAL_COOLDOWN_TAG = "none";
// The plunges' rows by their titles
const WikiTitlePathMap: Partial<Record<string, string>> = {
  "High Plunge": `plunges.${KitPlunge.High}.hits.0`,
  "Low Plunge": `plunges.${KitPlunge.Low}.hits.0`,
  "Plunging Attack Collision": "plungeCollision",
};

// The hit paths a talent's rows join to: the skill's own hits and the stances and holds it plays, whose labels the
// Skill reads, and the burst's
const SKILL_HIT_PATH_PREFIXES: readonly string[] = ["skill.", "stances.", "skillHolds."];
const checkIsTalentHitPath = (hitPath: string, combatTalent: CombatTalent): boolean =>
  combatTalent === CombatTalent.ElementalSkill
    ? SKILL_HIT_PATH_PREFIXES.some((prefix) => hitPath.startsWith(prefix))
    : hitPath.startsWith("burst.");

// A row title or a table label as the words they share, `1-Hit Swing DMG` and `Swing DMG` both `swing`
const toTitleWords = (title: string): string =>
  title
    .toLowerCase()
    .replaceAll(/\b\d+-hit\b|\bdmg\b/gu, "")
    .replaceAll(/[^a-z]+/gu, " ")
    .trim();
// A `hitFields` name as the words a row's title shares, `lunarBloom` as `Lunar Bloom`
const toNameWords = (name: string): string => name.replaceAll(/([a-z])([A-Z])/gu, "$1 $2");

// Every value the wiki's talent pages give a character's kit, by its path in the record, from each page's Advanced
// Properties: a normal attack's rows by their titles, `Normal Attack 3-Hit B` the third strike's second hit, the
// Charged attack's and the plunges' by theirs, and each of the skill's and burst's hits by the row titled as the table
// Labels the hit's multiplier, `Swing DMG` for `1-Hit Swing DMG`. Each row gives its hit's poise, its ICD tag and, where
// The hit is elemental, its gauge. A single `hitFields` hit, named `lunarBloom`, joins the skill's or burst's row of the
// Same name, its title's words matching the name's
export const getWikiKitCandidates = (
  pages: readonly WikiTalentPage[],
  { weaponType }: Pick<KitTables, "weaponType">,
  hitLabelMap: ReadonlyMap<string, string>,
  hitFieldNames: readonly string[] = [],
): Map<string, KitCandidate[]> => {
  const candidateMap = new Map<string, KitCandidate[]>();
  const addRow = (
    path: string,
    { gauge, internalCooldownTag, poise, row }: WikiAdvancedProperty,
    { revisionId, title }: WikiTalentPage,
    isElemental: boolean,
  ) => {
    const add = (key: string, value: unknown) =>
      addKitCandidate(candidateMap, `${path}.${key}`, {
        provenance: { page: title, revisionId, row, source: KitSource.Wiki },
        value,
      });
    if (poise !== undefined) add("poiseDamage", poise);
    if (internalCooldownTag !== undefined) {
      const tag =
        internalCooldownTag === WIKI_NO_INTERNAL_COOLDOWN_TAG
          ? undefined
          : (WikiInternalCooldownTagMap[internalCooldownTag] ?? internalCooldownTag);
      // A tag the enum does not name is not written, as the record would reject it; the row's poise still stands
      if (tag === undefined || (Object.values(InternalCooldownTag) as string[]).includes(tag))
        add("internalCooldownTag", tag);
    }
    if (isElemental && gauge !== undefined) add("gauge", gauge);
  };
  // The wiki writes a hit's gauge on every row, a physical strike's as well, so a row's gauge is read only where the
  // Hit is elemental by its slot: a skill's or a burst's, a catalyst's strikes and the plunge's collision
  const isCatalyst = weaponType === WeaponType.Catalyst;
  for (const page of pages)
    if (page.combatTalent === CombatTalent.NormalAttack)
      for (const property of page.properties) {
        const normalGroups = NORMAL_ATTACK_TITLE_REGEX.exec(property.title)?.groups;
        const chargedGroups = CHARGED_ATTACK_TITLE_REGEX.exec(property.title)?.groups;
        const plungePath = WikiTitlePathMap[property.title];
        if (normalGroups?.strike !== undefined) {
          const hitIndex = normalGroups.hit === undefined ? 0 : HIT_LETTERS.indexOf(normalGroups.hit);
          addRow(`normalAttacks.${Number(normalGroups.strike) - 1}.hits.${hitIndex}`, property, page, isCatalyst);
        } else if (chargedGroups !== undefined) {
          const hitIndex =
            chargedGroups.number === undefined
              ? chargedGroups.letter === undefined
                ? 0
                : HIT_LETTERS.indexOf(chargedGroups.letter)
              : Number(chargedGroups.number) - 1;
          addRow(`chargedAttack.hits.${hitIndex}`, property, page, isCatalyst);
        } else if (plungePath !== undefined)
          addRow(plungePath, property, page, isCatalyst || plungePath === "plungeCollision");
      }
    else {
      for (const [hitPath, label] of hitLabelMap) {
        const property = checkIsTalentHitPath(hitPath, page.combatTalent)
          ? page.properties.find(({ title }) => toTitleWords(title) === toTitleWords(label))
          : undefined;
        if (property !== undefined) addRow(hitPath, property, page, true);
      }
      if (page.combatTalent === CombatTalent.ElementalSkill || page.combatTalent === CombatTalent.ElementalBurst)
        for (const name of hitFieldNames) {
          const words = toTitleWords(toNameWords(name));
          const property = page.properties.find(({ title }) => toTitleWords(title) === words);
          if (property !== undefined) addRow(`hitFields.${name}`, property, page, true);
        }
    }
  return candidateMap;
};
