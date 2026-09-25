import { takeOne } from "@esposter/shared";
import MiniSearch from "minisearch";

// A search over a list already in memory: MiniSearch over the fields the caller names, every term required and each
// Read as a prefix, ranked — the one client-side index the repo searches with (/docs/architecture/search). An empty
// Query is no filter at all
export const searchItems = <TItem>(
  items: readonly TItem[],
  query: string,
  getFields: (item: TItem) => Record<string, string>,
  boost: Record<string, number> = {},
): TItem[] => {
  const [firstItem] = items;
  if (!query || firstItem === undefined) return [...items];

  const index = new MiniSearch<Record<string, number | string>>({
    fields: Object.keys(getFields(firstItem)),
    searchOptions: { boost, combineWith: "AND", prefix: true },
  });
  index.addAll(items.map((item, itemIndex) => ({ ...getFields(item), id: itemIndex })));
  return index.search(query).map(({ id }) => takeOne(items, Number(id)));
};
