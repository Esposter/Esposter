import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { ResourceListItem } from "#shared/models/resource/ResourceListItem";

export interface ResourceListSourceDefinition {
  // What an unfiltered but empty view says. Shared with the Home card's tabs, so a set is described the same
  // Way wherever it renders — the menu route and the card can never drift into two answers
  emptyState: { description: string; icon: string; title: string };
  // Merged into every read the view issues — the whole difference between the list routes
  filter: { isAccessed?: true; isFavorite?: true };
  icon: string;
  // The column this source is ordered by: always rendered, and never offered to the column chooser, because a
  // Sort key the reader can hide is a list they cannot explain
  pinnedColumnKey?: keyof ResourceListItem;
  sortBy: readonly SortItem<keyof ResourceListItem>[];
  title: string;
}
