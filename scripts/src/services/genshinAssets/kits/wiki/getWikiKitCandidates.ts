import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { KitHitLabel } from "#src/models/genshinAssets/kits/tables/KitHitLabel";
import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";
import type { WikiAdvancedProperty } from "#src/models/genshinAssets/kits/wiki/WikiAdvancedProperty";
import type { WikiTalentPage } from "#src/models/genshinAssets/kits/wiki/WikiTalentPage";

import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { addKitCandidate } from "#src/services/genshinAssets/kits/candidates/addKitCandidate";
import { WikiInternalCooldownTagMap } from "#src/services/genshinAssets/kits/wiki/WikiInternalCooldownTagMap";
import { CombatTalent, InternalCooldownTag, KitPlunge, WeaponType } from "genshin-world";
import { z } from "zod";

const NORMAL_ATTACK_TITLE_REGEX = /^Normal Attack (?<strike>\d+)(?:-Hit)?(?: (?<hit>[A-Z]))?$/u;
const CHARGED_ATTACK_TITLE_REGEX =
  /^(?:Charged Attack(?: (?:(?<number>\d+)-Hit|(?<letter>[A-Z])))?|Fully-Charged Aimed Shot)$/u;
const HIT_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const WIKI_NO_INTERNAL_COOLDOWN_TAG = "none";
const internalCooldownTagSchema = z.enum(InternalCooldownTag) satisfies z.ZodType<InternalCooldownTag>;
// The plunges' rows by their titles
const WikiTitlePathMap: Partial<Record<string, string>> = {
  "High Plunge": `plunges.${KitPlunge.High}.hits.0`,
  "Low Plunge": `plunges.${KitPlunge.Low}.hits.0`,
  "Plunging Attack Collision": "plungeCollision",
};

// A row title or a table label as the words they share, `1-Hit Swing DMG` and `Swing DMG` both `swing`
const toTitleWords = (title: string): string =>
  title
    .toLowerCase()
    .replaceAll(/\b\d+-hit\b|\bdmg\b/gu, "")
    .replaceAll(/[^a-z]+/gu, " ")
    .trim();

// Every value the wiki's talent pages give a character's kit, by its path in the record, from each page's Advanced
// Properties: a normal attack's rows by their titles, `Normal Attack 3-Hit B` the third strike's second hit, the
// Charged attack's and the plunges' by theirs, and each hit by the row titled as its multiplier's table label on the page
// Of the talent that label's proud skill group belongs to, `Swing DMG` for `1-Hit Swing DMG`. A named hit takes no row a
// Slot hit on the same page takes, as a row describes one attack. Each row gives its hit's poise, its ICD tag and, where
// The hit is elemental, its gauge
export const getWikiKitCandidates = (
  pages: readonly WikiTalentPage[],
  { talentGroupIdMap, weaponType }: Pick<KitTables, "talentGroupIdMap" | "weaponType">,
  hitLabelMap: ReadonlyMap<string, KitHitLabel>,
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
      if (tag === undefined || internalCooldownTagSchema.safeParse(tag).success) add("internalCooldownTag", tag);
    }
    if (isElemental && gauge !== undefined) add("gauge", gauge);
  };
  // The wiki writes a gauge on every row, a physical strike's and collision's as well, so a row's gauge is read only
  // Where the hit is elemental by its slot: a skill's or a burst's, and a catalyst's strikes, plunges and collision
  const isCatalyst = weaponType === WeaponType.Catalyst;
  for (const page of pages) {
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
        } else if (plungePath !== undefined) addRow(plungePath, property, page, isCatalyst);
      }
    const talentHitLabels = [...hitLabelMap].filter(
      ([, { proudSkillGroupId }]) => proudSkillGroupId === talentGroupIdMap[page.combatTalent],
    );
    const findLabelRow = ({ label }: KitHitLabel) =>
      page.properties.find(({ title }) => toTitleWords(title) === toTitleWords(label));
    // The rows a slot hit on this page joins, which a named hit reusing one of their labels does not take
    const slotHitRows = new Set(
      talentHitLabels.filter(([hitPath]) => !hitPath.startsWith("hits.")).map(([, hitLabel]) => findLabelRow(hitLabel)),
    );
    for (const [hitPath, hitLabel] of talentHitLabels) {
      const property = findLabelRow(hitLabel);
      if (property !== undefined && !(hitPath.startsWith("hits.") && slotHitRows.has(property)))
        addRow(hitPath, property, page, page.combatTalent !== CombatTalent.NormalAttack || isCatalyst);
    }
  }
  return candidateMap;
};
