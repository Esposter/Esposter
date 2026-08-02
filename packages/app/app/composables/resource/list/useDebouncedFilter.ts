import { RESOURCE_SEARCH_DEBOUNCE_MS } from "@/services/resource/search/constants";

// Every text filter the workbench owns (the search box, a tag pill's name and value) is part of the data
// Table's `search` prop, so writing one per keystroke resets the table to page 1 and re-runs both the count
// And the page query on every character, with the list flickering through partial-prefix results. Typing
// Buffers in a local clone and lands on the filter once it settles; the clone keeps filter → field flowing
// (back navigation, Clear filters) while the debounced value follows field → filter
export const useDebouncedFilter = (filter: Ref<string>) => {
  const { cloned: input } = useCloned(filter);
  const debounced = refDebounced(input, RESOURCE_SEARCH_DEBOUNCE_MS);

  watch(debounced, (newValue) => {
    filter.value = newValue;
  });

  return { debounced, input };
};
