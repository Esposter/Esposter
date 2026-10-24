import type { SelectItemCategoryDefinition } from "@/models/shared/SelectItemCategoryDefinition";

// The select's string is the number's own string, and a choice is written back as the number of the option that string
// Names, which the list it was offered from holds
export const useNumberSelect = <T extends number>(selected: Ref<T>, items: SelectItemCategoryDefinition<T>[]) =>
  computed({
    get: () => String(selected.value),
    set: (newValue) => {
      const item = items.find(({ value }) => String(value) === newValue);
      if (item) selected.value = item.value;
    },
  });
