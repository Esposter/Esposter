import { IRREGULAR_FAMILY_LABEL_SINGULARS } from "#src/services/genshinAssets/camps/constants";
import { toWikiPageVariants } from "#src/services/genshinAssets/camps/toWikiPageVariants";
import { Element, EnemyKindId } from "genshin-world";

export interface FamilyLabelMap {
  matches: FamilyLabelMatch[];
  unmapped: FamilyLabelUnmapped[];
}

export interface FamilyLabelMatch {
  kindId: EnemyKindId;
  label: string;
  page: string;
  variant: string;
}

// Whether a family page lists a variant of the label; when it does not, the world may still hold a kind of its family
export interface FamilyLabelUnmapped {
  isListed: boolean;
  label: string;
}

export interface FamilyPageContent {
  content: string;
  title: string;
}

const WORLD_KIND_IDS: ReadonlySet<number> = new Set(Object.values(EnemyKindId));
const ELEMENT_WORDS: ReadonlySet<string> = new Set(Object.keys(Element));

const checkWorldKindId = (id: number): id is EnemyKindId => WORLD_KIND_IDS.has(id);

// The singular a label's variants name it by: its irregular singular, else each word's final s dropped
const toSingularLabel = (label: string): string =>
  IRREGULAR_FAMILY_LABEL_SINGULARS.get(label) ??
  label
    .split(" ")
    .map((word) => (word.length > 3 && word.endsWith("s") && !word.endsWith("ss") ? word.slice(0, -1) : word))
    .join(" ");

const toPluralLabel = (label: string): string => (label.endsWith("s") ? label : `${label}s`);

// A name with its element words dropped, so that Fatui Pyro Agent is a Fatui Agent
const stripElementWords = (name: string): string =>
  name
    .split(" ")
    .filter((word) => !ELEMENT_WORDS.has(word))
    .join(" ");

// Whether a name is a family term of a form, or the form a family term of the name: the name is the form, a variant of it
// (Fatui Skirmisher - Geochanter Bracer, Abyss Herald: Frost Fall, Cryo Abyss Mage), or the form is a variant the name
// Is the family of (Fatui Mirror Maiden is the family of Mirror Maiden)
const checkIsFamilyTerm = (name: string, form: string): boolean =>
  name === form ||
  name.startsWith(`${form}:`) ||
  name.startsWith(`${form} -`) ||
  name.endsWith(` ${form}`) ||
  stripElementWords(name) === form ||
  form.endsWith(` ${name}`);

// Maps each family label to the lowest-id kind the world holds of its family, on the first of the pages that lists the
// Family, with the first title the page lists for it as the variant. A label's family is its own name, its singular and
// Plural, and the title the wiki redirects it to. A label no page lists, or no world kind is of its family, is unmapped
export const buildFamilyLabelEnemyKindIdMap = (
  labels: readonly string[],
  pages: readonly FamilyPageContent[],
  monsters: readonly { id: number; name: string }[],
  redirects: ReadonlyMap<string, string>,
): FamilyLabelMap => {
  const kinds = monsters
    .flatMap(({ id, name }) => (checkWorldKindId(id) ? [{ id, name }] : []))
    .toSorted((firstKind, secondKind) => firstKind.id - secondKind.id);
  const variantPages = pages.map(({ content, title }) => ({ title, variants: toWikiPageVariants(content) }));
  const matches: FamilyLabelMatch[] = [];
  const unmapped: FamilyLabelUnmapped[] = [];
  for (const label of labels) {
    const names = [label, redirects.get(label)].filter((name) => name !== undefined);
    const forms = [...new Set(names.flatMap((name) => [name, toSingularLabel(name), toPluralLabel(name)]))];
    const isOfFamily = (name: string) => forms.some((form) => checkIsFamilyTerm(name, form));
    const listing = variantPages
      .map(({ title, variants }) => ({ page: title, variant: variants.find((variant) => isOfFamily(variant)) }))
      .find((candidate) => candidate.variant !== undefined);
    const kind = kinds.find(({ name }) => isOfFamily(name));
    if (listing?.variant === undefined) unmapped.push({ isListed: false, label });
    else if (kind === undefined) unmapped.push({ isListed: true, label });
    else matches.push({ kindId: kind.id, label, page: listing.page, variant: listing.variant });
  }
  return { matches, unmapped };
};
