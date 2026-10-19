import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { KitHitLabel } from "#src/models/genshinAssets/kits/tables/KitHitLabel";
import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";
import type { WikiAdvancedProperty } from "#src/models/genshinAssets/kits/wiki/WikiAdvancedProperty";
import type { WikiTalentPage } from "#src/models/genshinAssets/kits/wiki/WikiTalentPage";

import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { addKitCandidate } from "#src/services/genshinAssets/kits/candidates/addKitCandidate";
import { GCSIM_TRAVELER_FORM, TRAVELER_NAME } from "#src/services/genshinAssets/kits/constants";
import { findFirstTierRows } from "#src/services/genshinAssets/kits/wiki/findFirstTierRows";
import { findLabelRows } from "#src/services/genshinAssets/kits/wiki/findLabelRows";
import { getSlotPath } from "#src/services/genshinAssets/kits/wiki/getSlotPath";
import { WikiInternalCooldownTagMap } from "#src/services/genshinAssets/kits/wiki/WikiInternalCooldownTagMap";
import { CombatTalent, InternalCooldownTag, WeaponType } from "genshin-world";
import { z } from "zod";

// A slot row's title without its trailing bracketed part, so `Normal Attack 1-Hit (Target Within 2m)` is the first
// Strike's row
const TRAILING_BRACKETED_PART_REGEX = /\s*\([^()]*\)$/u;
const WIKI_NO_INTERNAL_COOLDOWN_TAG = "none";
const internalCooldownTagSchema = z.enum(InternalCooldownTag) satisfies z.ZodType<InternalCooldownTag>;

// Every value the wiki's talent pages give a character's kit, by its path in the record, from each page's Advanced
// Properties. A slot's row is the one its title matches exactly, and only where the slot has none, a row whose title
// Matches once its trailing bracketed part is removed, so `Fully-Charged Aimed Shot` gives the charged shot before its
// `(Hit Weak Spot)` variant. Each hit takes the rows its table label finds (`findLabelRows`) on the page of the talent
// Whose proud skill group that label belongs to, `Swing DMG` for `1-Hit Swing DMG`, and a named hit takes no row a slot
// Hit on the same page takes, as a row describes one attack. Each path takes a field the rows matched to it give alike,
// From the first row giving it: the poise, the ICD tag and, where the hit is elemental, the gauge
export const getWikiKitCandidates = (
  pages: readonly WikiTalentPage[],
  { name, talentGroupIdMap, weaponType }: Pick<KitTables, "name" | "talentGroupIdMap" | "weaponType">,
  hitLabelMap: ReadonlyMap<string, KitHitLabel>,
): Map<string, KitCandidate[]> => {
  const candidateMap = new Map<string, KitCandidate[]>();
  const addRows = (
    path: string,
    rows: readonly WikiAdvancedProperty[],
    { revisionId, title }: WikiTalentPage,
    isElemental: boolean,
  ) => {
    // The first row giving a field, where every row giving it gives the same value
    const addAgreed = (key: string, givens: readonly { row: WikiAdvancedProperty; value: unknown }[]) => {
      const [first] = givens;
      if (first === undefined || givens.some(({ value }) => value !== first.value)) return;
      addKitCandidate(candidateMap, `${path}.${key}`, {
        provenance: { page: title, revisionId, row: first.row.row, source: KitSource.Wiki },
        value: first.value,
      });
    };
    addAgreed(
      "poiseDamage",
      rows.flatMap((row) => (row.poise === undefined ? [] : [{ row, value: row.poise }])),
    );
    addAgreed(
      "internalCooldownTag",
      rows.flatMap((row): { row: WikiAdvancedProperty; value: unknown }[] => {
        if (row.internalCooldownTag === undefined) return [];
        if (row.internalCooldownTag === WIKI_NO_INTERNAL_COOLDOWN_TAG) return [{ row, value: undefined }];
        const tag = WikiInternalCooldownTagMap[row.internalCooldownTag] ?? row.internalCooldownTag;
        // A tag the enum does not name is given by no row, as the record would reject it; the row's poise still stands
        return internalCooldownTagSchema.safeParse(tag).success ? [{ row, value: tag }] : [];
      }),
    );
    if (isElemental)
      addAgreed(
        "gauge",
        rows.flatMap((row) => (row.gauge === undefined ? [] : [{ row, value: row.gauge }])),
      );
  };
  // The wiki writes a hit's gauge on every row, a physical strike's as well, so a row's gauge is read only where the
  // Hit is elemental by its slot: a skill's or a burst's, a catalyst's strikes and the plunge's collision
  const isCatalyst = weaponType === WeaponType.Catalyst;
  // A traveler's talent page holds a block under each of its two forms, so the kit reads its own form's block and any
  // Block with no heading, the form gcsim reads the traveler as. Every other character's rows are all read
  const checkIsReadRow = ({ heading }: WikiAdvancedProperty) =>
    name !== TRAVELER_NAME || heading === undefined || heading === GCSIM_TRAVELER_FORM;
  for (const page of pages) {
    const properties = page.properties.filter((property) => checkIsReadRow(property));
    if (page.combatTalent === CombatTalent.NormalAttack) {
      const slotPaths = new Set(
        properties.flatMap(({ title }) => [
          getSlotPath(title),
          getSlotPath(title.replace(TRAILING_BRACKETED_PART_REGEX, "")),
        ]),
      );
      for (const path of slotPaths) {
        if (path === undefined) continue;
        const rows = findFirstTierRows(properties, [
          (title) => getSlotPath(title) === path,
          (title) => getSlotPath(title.replace(TRAILING_BRACKETED_PART_REGEX, "")) === path,
        ]);
        addRows(path, rows, page, isCatalyst || path === "plungeCollision");
      }
    }
    const talentHitLabels = [...hitLabelMap].filter(
      ([, { proudSkillGroupId }]) => proudSkillGroupId === talentGroupIdMap[page.combatTalent],
    );
    // The rows a slot hit on this page joins, which a named hit reusing one of their labels does not take
    const slotHitRows = new Set(
      talentHitLabels
        .filter(([hitPath]) => !hitPath.startsWith("hits."))
        .flatMap(([, { label }]) => findLabelRows(label, properties)),
    );
    for (const [hitPath, { label }] of talentHitLabels) {
      const rows = findLabelRows(label, properties);
      addRows(
        hitPath,
        hitPath.startsWith("hits.") ? rows.filter((row) => !slotHitRows.has(row)) : rows,
        page,
        page.combatTalent !== CombatTalent.NormalAttack || isCatalyst,
      );
    }
  }
  return candidateMap;
};
