import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { ResourceListItem } from "#shared/models/resource/ResourceListItem";

export interface ResourceListSourceDefinition {
  // What an unfiltered but empty view says. Shared with the Home card's tabs, so a set is described the same
  // Way wherever it renders — the menu route and the card can never drift into two answers
  emptyState: { description: string; title: string };
  // Merged into every read the view issues — the whole difference between the list routes
  filter: { isAccessed?: true; isFavorite?: true };
  icon: string;
  // The column this source is ordered by: always rendered, and never offered to the column chooser
  pinnedColumnKey?: keyof ResourceListItem;
  sortBy: readonly SortItem<keyof ResourceListItem>[];
  title: string;
  // Held here so the service menu and the search dropdown's Pages group derive their rows from the source
  // Registry rather than each restating a route and an icon
  to: string;
}
