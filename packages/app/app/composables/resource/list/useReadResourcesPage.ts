import type { ReadResourcesOptions } from "@/models/resource/list/ReadResourcesOptions";
import type { Resource } from "@esposter/db-schema";

interface ReadResourcesPageOptions<TFilterInput> {
  // Resolved once per read and handed to both queries, so the total and the rows always describe the same
  // Filter — a relative Updated preset anchors its boundary to Date.now(), so two calls a millisecond apart
  // Would count over a window the page never read
  getFilterInput: () => TFilterInput;
  // Identity of the query the total belongs to. Vuetify reports a page change, a page-size change and a sort
  // Change through the same @update:options as a filter change, and none of the first three move the total —
  // For a search it is a COUNT(*) behind a trigram predicate over every resource the caller owns. It is the
  // Filter the caller picked, never the resolved input: a key holding a Date.now()-anchored boundary never
  // Repeats, so the total would be re-counted on every one of those three
  getFilterKey: () => string;
  readCount: (filterInput: TFilterInput) => Promise<number>;
  readPage: (options: ReadResourcesOptions, filterInput: TFilterInput) => Promise<Resource[]>;
}

// The one reader behind every server-paged resource table (the workbench list and the Recycle bin). Both page
// A server-side offset query and count it once per filter, and both can fire overlapping reads — debounced
// Search, filter pills, Refresh, Retry, a restore or a purge — so a stale response must neither overwrite
// Fresher rows nor flip loading state early. A stale page paired with a fresher pager is how a purge lands on
// A row the user never picked
export const useReadResourcesPage = <TFilterInput>({
  getFilterInput,
  getFilterKey,
  readCount,
  readPage,
}: ReadResourcesPageOptions<TFilterInput>) => {
  const { executeQuery, isPending: isLoading } = useMutation();
  const items = ref<Resource[]>([]);
  const count = ref(0);
  const error = ref("");
  // Remembered so Refresh, Retry or a mutation can re-run the exact page the table last asked for
  let lastOptions: ReadResourcesOptions | undefined;
  // Undefined until a count lands, since "" is itself a valid key (a list nothing filters)
  let countedFilterKey: string | undefined;
  // The table is one target, so every read supersedes the one before it
  const key = Symbol("useReadResourcesPage");
  const read = async (options: ReadResourcesOptions) => {
    lastOptions = options;
    const filterInput = getFilterInput();
    const filterKey = getFilterKey();
    const isCounted = filterKey === countedFilterKey;
    error.value = "";
    await executeQuery(
      async () => {
        const [newCount, newItems] = await Promise.all([
          isCounted ? undefined : readCount(filterInput),
          readPage(options, filterInput),
        ]);
        return { newCount, newItems };
      },
      {
        key,
        onError: (readError) => {
          // A failed read clears the list — keeping the previous query's rows would pass them off as this query's result
          items.value = [];
          count.value = 0;
          countedFilterKey = undefined;
          error.value = readError.message;
        },
        onSuccess: ({ newCount, newItems }) => {
          // Left alone when the count was reused, so an optimistic adjustment made mid-flight (a delete drops the
          // Rows and the total together) is not overwritten by the total this read started with
          if (newCount !== undefined) count.value = newCount;
          countedFilterKey = filterKey;
          items.value = newItems;
        },
      },
    );
  };
  // A refresh follows a mutation (delete, restore, purge) or an explicit retry, either of which moves the
  // Total, so it re-counts instead of reusing the one it already has
  const refresh = () => {
    countedFilterKey = undefined;
    return lastOptions ? read(lastOptions) : Promise.resolve();
  };
  return { count, error, getLastSortBy: () => lastOptions?.sortBy ?? [], isLoading, items, read, refresh };
};
