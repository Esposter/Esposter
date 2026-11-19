import type { PaletteGroup } from "#src/models/ui/palette/PaletteGroup";

import { checkIsPaletteSearching } from "#src/services/ui/palette/checkIsPaletteSearching";
import { normalizeString } from "@esposter/shared";

// A query matches a kind by its title, or every kind of a group by the group's own title, and a group with no match is
// Left out so the palette shows no empty heading
export const filterPaletteGroups = (groups: readonly PaletteGroup[], query: string): PaletteGroup[] => {
  if (!checkIsPaletteSearching(query)) return [...groups];
  const normalizedQuery = normalizeString(query).toLowerCase();
  return groups.flatMap((group) => {
    if (group.title.toLowerCase().includes(normalizedQuery)) return [group];
    const items = group.items.filter(({ title }) => title.toLowerCase().includes(normalizedQuery));
    return items.length > 0 ? [{ ...group, items }] : [];
  });
};
