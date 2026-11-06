import type { PaletteGroup } from "@/models/ui/palette/PaletteGroup";

// A query matches a kind by its title, or every kind of a group by the group's own title, and a group with no match is
// Left out so the palette shows no empty heading
export const filterPaletteGroups = (groups: readonly PaletteGroup[], query: string): PaletteGroup[] => {
  const normalizedQuery = query.trim().toLowerCase();
  if (normalizedQuery === "") return [...groups];
  return groups.flatMap((group) => {
    if (group.title.toLowerCase().includes(normalizedQuery)) return [group];
    const items = group.items.filter(({ title }) => title.toLowerCase().includes(normalizedQuery));
    return items.length > 0 ? [{ ...group, items }] : [];
  });
};
