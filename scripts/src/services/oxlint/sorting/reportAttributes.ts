import type { SortingItem } from "#src/models/oxlint/sorting/SortingItem";
import type { Context, ESTree } from "@oxlint/plugins";

import { reportUnsorted } from "#src/services/oxlint/sorting/reportUnsorted";

// Sorts the attributes of an import or an export by their key, a string key by its value
export const reportAttributes = (context: Context, attributes: ESTree.ImportAttribute[]): void => {
  const items: SortingItem[] = attributes.map((attribute) => ({
    name: attribute.key.type === "Identifier" ? attribute.key.name : attribute.key.value,
    node: attribute,
  }));
  reportUnsorted(context, items);
};
