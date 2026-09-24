import { TYPEAHEAD_RESET_MS } from "@/services/ui/constants";
// A list's typeahead, as the listbox and menu patterns describe it: typed characters jump to the next title they
// Begin, a pause starts the search over, and one character pressed again steps through every title it begins
export const useTypeahead = () => {
  let query = "";
  const { start } = useTimeoutFn(
    () => {
      query = "";
    },
    TYPEAHEAD_RESET_MS,
    { immediate: false },
  );
  // The index of the title the key moves to, or undefined when the key is not typing or matches nothing
  return (event: KeyboardEvent, titles: string[], currentIndex: number) => {
    if (event.key.length !== 1 || event.altKey || event.ctrlKey || event.metaKey) return undefined;
    // A space is the key that picks, unless it continues a search already under way
    if (event.key === " " && !query) return undefined;
    query += event.key.toLowerCase();
    start();
    const isRepeated = /^(?<character>.)\k<character>*$/u.test(query);
    const search = isRepeated ? query.slice(0, 1) : query;
    // A new search, or one character stepping on, starts after the current title; a longer query may still match it
    const startIndex = query.length === 1 || isRepeated ? currentIndex + 1 : Math.max(currentIndex, 0);
    return titles
      .map((_title, offset) => (startIndex + offset) % titles.length)
      .find((candidateIndex) => titles[candidateIndex]?.toLowerCase().startsWith(search));
  };
};
