import type { SuggestionKeyDownProps } from "@tiptap/suggestion";

export const useSuggestionListNavigation = <TItem>(
  items: MaybeRefOrGetter<TItem[]>,
  selectItem: (index: number) => void,
) => {
  const selectedIndex = ref(0);
  const onKeyDown = ({ event }: Pick<SuggestionKeyDownProps, "event">) => {
    const itemsValue = toValue(items);
    // An empty list makes the arrow-key modulo divide by zero (NaN), which Enter would then pass to takeOne
    if (itemsValue.length === 0) return false;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        selectedIndex.value = (selectedIndex.value + 1) % itemsValue.length;
        return true;
      case "ArrowUp":
        event.preventDefault();
        selectedIndex.value = (selectedIndex.value + itemsValue.length - 1) % itemsValue.length;
        return true;
      case "Enter":
        event.preventDefault();
        selectItem(selectedIndex.value);
        return true;
      default:
        return false;
    }
  };

  watch(
    () => toValue(items),
    () => {
      selectedIndex.value = 0;
    },
  );

  return { onKeyDown, selectedIndex };
};
