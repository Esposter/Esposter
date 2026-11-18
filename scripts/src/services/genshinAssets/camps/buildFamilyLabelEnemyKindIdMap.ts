import { IRREGULAR_FAMILY_LABEL_SINGULARS } from "#src/services/genshinAssets/camps/constants";
import { toWikiPageVariants } from "#src/services/genshinAssets/camps/toWikiPageVariants";
import { EnemyKindId } from "genshin-world";

export interface FamilyLabelMap {
  matches: FamilyLabelMatch[];
  unmapped: string[];
}

export interface FamilyLabelMatch {
  kindId: EnemyKindId;
  label: string;
  page: string;
  variant: string;
}

export interface FamilyPageContent {
  content: string;
  title: string;
}

const WORLD_KIND_IDS: ReadonlySet<number> = new Set(Object.values(EnemyKindId));

const checkWorldKindId = (id: number): id is EnemyKindId => WORLD_KIND_IDS.has(id);

// The singular a label's variants name it by: its irregular singular, else each word's final s dropped
const toSingularLabel = (label: string): string =>
  IRREGULAR_FAMILY_LABEL_SINGULARS.get(label) ??
  label
    .split(" ")
    .map((word) => (word.length > 3 && word.endsWith("s") && !word.endsWith("ss") ? word.slice(0, -1) : word))
    .join(" ");

// Maps each family label to the first variant that is a kind the world holds, taken in the order of the pages and then of
// Each page's links. A variant the page names exactly comes before one that carries the family term, so `Hilichurl` is
// The Hilichurl and not a variant that merely ends in it. A variant's kind is the lowest-id world kind its name is. A label
// No matching variant leads to a kind is unmapped, and no kind is given to it
export const buildFamilyLabelEnemyKindIdMap = (
  labels: readonly string[],
  pages: readonly FamilyPageContent[],
  monsters: readonly { id: number; name: string }[],
): FamilyLabelMap => {
  const nameKindIdMap = new Map<string, EnemyKindId>();
  for (const { id, name } of monsters.toSorted((firstMonster, secondMonster) => firstMonster.id - secondMonster.id))
    if (checkWorldKindId(id) && !nameKindIdMap.has(name)) nameKindIdMap.set(name, id);
  const variantPages = pages.map(({ content, title }) => ({ title, variants: toWikiPageVariants(content) }));
  const matches: FamilyLabelMatch[] = [];
  const unmapped: string[] = [];
  for (const label of labels) {
    const forms = [...new Set([label, toSingularLabel(label)])];
    const exactCandidates = variantPages.flatMap(({ title, variants }) =>
      variants.filter((variant) => forms.includes(variant)).map((variant) => ({ page: title, variant })),
    );
    const familyTermCandidates = variantPages.flatMap(({ title, variants }) =>
      variants
        .filter((variant) => forms.some((form) => variant.endsWith(` ${form}`) || variant.startsWith(`${form}:`)))
        .map((variant) => ({ page: title, variant })),
    );
    const match = [...exactCandidates, ...familyTermCandidates].flatMap(({ page, variant }) => {
      const kindId = nameKindIdMap.get(variant);
      return kindId === undefined ? [] : [{ kindId, label, page, variant }];
    });
    const [firstMatch] = match;
    if (firstMatch === undefined) unmapped.push(label);
    else matches.push(firstMatch);
  }
  return { matches, unmapped };
};
