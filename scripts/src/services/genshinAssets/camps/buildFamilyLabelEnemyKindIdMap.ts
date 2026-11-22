import type { FamilyLabelMap } from "#src/models/genshinAssets/camps/FamilyLabelMap";
import type { FamilyLabelMatch } from "#src/models/genshinAssets/camps/FamilyLabelMatch";
import type { FamilyLabelUnmapped } from "#src/models/genshinAssets/camps/FamilyLabelUnmapped";
import type { FamilyPageContent } from "#src/models/genshinAssets/camps/FamilyPageContent";

import { checkIsFamilyTerm } from "#src/services/genshinAssets/camps/checkIsFamilyTerm";
import { checkWorldKindId } from "#src/services/genshinAssets/camps/checkWorldKindId";
import { toPluralLabel } from "#src/services/genshinAssets/camps/toPluralLabel";
import { toSingularLabel } from "#src/services/genshinAssets/camps/toSingularLabel";
import { toWikiPageVariants } from "#src/services/genshinAssets/camps/toWikiPageVariants";

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
