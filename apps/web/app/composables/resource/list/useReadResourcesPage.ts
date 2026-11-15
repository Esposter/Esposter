import type { ResourceListItem } from "#shared/models/resource/ResourceListItem";
import type { ResourceListPage } from "#shared/models/resource/ResourceListPage";
import type { ReadResourcesOptions } from "@/models/resource/list/ReadResourcesOptions";

interface ReadResourcesPageOptions<TFilterInput> {
  // Resolved once per read and handed to every page of it, so a relative Updated preset anchors its boundary to one instant
  getFilterInput: () => TFilterInput;
  // Identity of the query the total belongs to. It is the filter the caller picked, never the resolved input: a key holding
  // A Date.now()-anchored boundary never repeats, so the total would be counted again on every page turn
  getFilterKey: () => string;
  // One page from its cursor. The first page, read from "", also answers the total
  readPage: (cursor: string, filterInput: TFilterInput, options: ReadResourcesOptions) => Promise<ResourceListPage>;
}
// The one reader behind every server-paged resource table (the workbench list and the Recycle bin). A table pages by number
// But a cursor cannot be read by number, so each page number maps to the cursor that starts it: a page change reads only the
// Cursors it has not walked to yet. A cursor orders by the sort and the page size it was read under, so the map starts over
// When either changes, and when the filter does. The first page answers the total, read again whenever a new filter or a
// Refresh asks for it, so a total never goes stale behind the rows
export const useReadResourcesPage = <TFilterInput>({
  getFilterInput,
  getFilterKey,
  readPage,
}: ReadResourcesPageOptions<TFilterInput>) => {
  const { executeQuery, isPending } = useMutation();
  const items = ref<ResourceListItem[]>([]);
  const count = ref(0);
  const error = ref("");
  // Remembered so Refresh, Retry or a mutation can re-run the exact page the table last asked for
  let lastOptions: ReadResourcesOptions | undefined;
  // The cursor that starts each page, the first from "" so it is always known
  let cursors = [""];
  let cursorsKey = "";
  // Undefined until a total lands, since "" is itself a valid key (a list nothing filters)
  let countedFilterKey: string | undefined;
  // The table is one target, so every read supersedes the one before it
  const key = Symbol("useReadResourcesPage");
  const read = async (options: ReadResourcesOptions) => {
    lastOptions = options;
    const filterInput = getFilterInput();
    const filterKey = getFilterKey();
    const cursorsQueryKey = JSON.stringify([filterKey, options.itemsPerPage, options.sortBy]);
    if (cursorsQueryKey !== cursorsKey) {
      cursorsKey = cursorsQueryKey;
      cursors = [""];
    }
    // This read walks and writes its own map, so a read superseded by a new query never writes into the map the new query holds
    const pageCursors = cursors;
    const index = options.page - 1;
    const isCounted = filterKey === countedFilterKey;
    error.value = "";
    await executeQuery(
      async () => {
        // The first page is read when the total is wanted, when the table is on it, and when the next cursor is still unknown
        const firstPage =
          index === 0 || !isCounted || pageCursors.length === 1 ? await readPage("", filterInput, options) : undefined;
        if (firstPage?.nextCursor && pageCursors.length === 1) pageCursors[1] = firstPage.nextCursor;
        // Walks forward from the last cursor it knows, a page at a time, to the one this page starts at
        while (pageCursors.length <= index) {
          // Written where its page starts rather than pushed, so an overlapping read writes the same cursor in place
          const position = pageCursors.length;
          // oxlint-disable-next-line no-await-in-loop -- Each page's cursor comes from the page before it, so the walk is serial
          const walkedPage = await readPage(pageCursors[position - 1] ?? "", filterInput, options);
          // Past the last page there is nothing to walk to, so the table is shown empty beside the total
          if (!walkedPage.nextCursor) return { newCount: firstPage?.count, newItems: [] };
          pageCursors[position] = walkedPage.nextCursor;
        }
        const page =
          index === 0 && firstPage ? firstPage : await readPage(pageCursors[index] ?? "", filterInput, options);
        if (page.nextCursor && pageCursors.length === index + 1) pageCursors[index + 1] = page.nextCursor;
        return { newCount: firstPage?.count, newItems: page.items };
      },
      {
        key,
        onError: (readError) => {
          // A failed read clears the list, since keeping the previous query's rows would pass them off as this query's result
          items.value = [];
          count.value = 0;
          countedFilterKey = undefined;
          error.value = readError.message;
        },
        onSuccess: ({ newCount, newItems }) => {
          // A read that reused the previous total issued no first page, so it has no total to write
          if (newCount !== undefined) {
            count.value = newCount;
            countedFilterKey = filterKey;
          }
          items.value = newItems;
        },
      },
    );
  };
  // A refresh follows a mutation (delete, restore, purge) or an explicit retry, either of which moves the total, so the
  // First page is read again for it rather than reusing the total it has
  const refresh = () => {
    countedFilterKey = undefined;
    return lastOptions ? read(lastOptions) : Promise.resolve();
  };
  return { count, error, getLastSortBy: () => lastOptions?.sortBy ?? [], isPending, items, read, refresh };
};
