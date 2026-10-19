import type { KitCandidate } from "#src/models/genshinAssets/kits/KitCandidate";
import type { KitHitLabel } from "#src/models/genshinAssets/kits/tables/KitHitLabel";
import type { KitTables } from "#src/models/genshinAssets/kits/tables/KitTables";
import type { WikiAdvancedProperty } from "#src/models/genshinAssets/kits/wiki/WikiAdvancedProperty";
import type { WikiTalentPage } from "#src/models/genshinAssets/kits/wiki/WikiTalentPage";

import { KitSource } from "#src/models/genshinAssets/kits/KitSource";
import { addKitCandidate } from "#src/services/genshinAssets/kits/candidates/addKitCandidate";
import { findLabelRows } from "#src/services/genshinAssets/kits/wiki/findLabelRows";
import { WikiInternalCooldownTagMap } from "#src/services/genshinAssets/kits/wiki/WikiInternalCooldownTagMap";
import { CombatTalent, InternalCooldownTag, KitPlunge, WeaponType } from "genshin-world";
import { z } from "zod";

const NORMAL_ATTACK_TITLE_REGEX = /^Normal Attack (?<strike>\d+)(?:-Hit)?(?: (?<hit>[A-Z]))?$/u;
const CHARGED_ATTACK_TITLE_REGEX =
  /^(?:Charged Attack(?: (?:(?<number>\d+)-Hit|(?<letter>[A-Z])))?|Fully-Charged Aimed Shot)$/u;
// A slot row's title without its trailing bracketed part, so `Normal Attack 1-Hit (Target Within 2m)` is the first
// Strike's row
const TRAILING_BRACKETED_PART_REGEX = /\s*\([^()]*\)$/u;
const HIT_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const WIKI_NO_INTERNAL_COOLDOWN_TAG = "none";
const internalCooldownTagSchema = z.enum(InternalCooldownTag) satisfies z.ZodType<InternalCooldownTag>;
// The plunges' rows by their titles
const WikiTitlePathMap: Partial<Record<string, string>> = {
  "High Plunge": `plunges.${KitPlunge.High}.hits.0`,
  "Low Plunge": `plunges.${KitPlunge.Low}.hits.0`,
  "Plunging Attack Collision": "plungeCollision",
};

// Every value the wiki's talent pages give a character's kit, by its path in the record, from each page's Advanced
// Properties. A normal attack's, charged attack's and plunges' rows are matched by their titles without a trailing
// Bracketed part, `Normal Attack 3-Hit B` the third strike's second hit. Each hit takes the rows its table label finds
// (`findLabelRows`) on the page of the talent whose proud skill group that label belongs to, `Swing DMG` for
// `1-Hit Swing DMG`, and a named hit takes no row a slot hit on the same page takes, as a row describes one attack.
// Each path takes a field the rows matched to it give alike, from the first row giving it: the poise, the ICD tag and,
// Where the hit is elemental, the gauge
export const getWikiKitCandidates = (
  pages: readonly WikiTalentPage[],
  { talentGroupIdMap, weaponType }: Pick<KitTables, "talentGroupIdMap" | "weaponType">,
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
  for (const page of pages) {
    if (page.combatTalent === CombatTalent.NormalAttack) {
      // The rows matched to each slot path, added once per path so the fields they give alike stand
      const slotRowMap = new Map<string, WikiAdvancedProperty[]>();
      const addSlotRow = (path: string, property: WikiAdvancedProperty) =>
        slotRowMap.set(path, [...(slotRowMap.get(path) ?? []), property]);
      for (const property of page.properties) {
        const slotTitle = property.title.replace(TRAILING_BRACKETED_PART_REGEX, "");
        const normalGroups = NORMAL_ATTACK_TITLE_REGEX.exec(slotTitle)?.groups;
        const chargedGroups = CHARGED_ATTACK_TITLE_REGEX.exec(slotTitle)?.groups;
        const plungePath = WikiTitlePathMap[slotTitle];
        if (normalGroups?.strike !== undefined) {
          const hitIndex = normalGroups.hit === undefined ? 0 : HIT_LETTERS.indexOf(normalGroups.hit);
          addSlotRow(`normalAttacks.${Number(normalGroups.strike) - 1}.hits.${hitIndex}`, property);
        } else if (chargedGroups !== undefined) {
          const hitIndex =
            chargedGroups.number === undefined
              ? chargedGroups.letter === undefined
                ? 0
                : HIT_LETTERS.indexOf(chargedGroups.letter)
              : Number(chargedGroups.number) - 1;
          addSlotRow(`chargedAttack.hits.${hitIndex}`, property);
        } else if (plungePath !== undefined) addSlotRow(plungePath, property);
      }
      for (const [path, rows] of slotRowMap) addRows(path, rows, page, isCatalyst || path === "plungeCollision");
    }
    const talentHitLabels = [...hitLabelMap].filter(
      ([, { proudSkillGroupId }]) => proudSkillGroupId === talentGroupIdMap[page.combatTalent],
    );
    // The rows a slot hit on this page joins, which a named hit reusing one of their labels does not take
    const slotHitRows = new Set(
      talentHitLabels
        .filter(([hitPath]) => !hitPath.startsWith("hits."))
        .flatMap(([, { label }]) => findLabelRows(label, page.properties)),
    );
    for (const [hitPath, { label }] of talentHitLabels) {
      const rows = findLabelRows(label, page.properties);
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
