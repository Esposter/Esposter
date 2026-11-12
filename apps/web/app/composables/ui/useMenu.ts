import type { UiMenuItem } from "@/models/ui/UiMenuItem";
import type { UiMenuOptions } from "@/models/ui/UiMenuOptions";
import type { usePopover } from "@vuetify/v0";

import { takeOne } from "@esposter/shared";
import { useRovingFocus } from "@vuetify/v0";

// A menu's keyboard contract over a popover, as the menu button pattern has it: it opens onto its first item, or its
// Last when the up arrow opened it; arrows, Home and End walk it and typeahead jumps; Enter or Space picks, Escape
// Closes, and either hands focus back. An item with children opens them beneath it instead of being picked, on Enter,
// Space, a click or the right arrow, and the left arrow shuts them. Where the popover hangs is the caller's, a trigger
// Or a point
export const useMenu = <T extends string>(
  items: MaybeRefOrGetter<UiMenuItem<T>[]>,
  { close, id, isOpen, open }: Pick<ReturnType<typeof usePopover>, "close" | "id" | "isOpen" | "open">,
  { onSelect, returnFocusTo }: UiMenuOptions<T>,
) => {
  const getItemId = (index: number) => `${id}-item-${index}`;
  const expandedValues = ref<T[]>([]);
  // The rows the menu draws and its arrows walk: the items, each followed by its children while it is open
  const rows = computed<UiMenuItem<T>[]>(() =>
    toValue(items).flatMap((item) => {
      if (!item.children) return [item];

      const isExpanded = expandedValues.value.includes(item.value);
      return [{ ...item, isExpanded }, ...(isExpanded ? item.children.map((child) => ({ ...child, depth: 1 })) : [])];
    }),
  );
  const {
    first,
    focus,
    focusedId,
    isTabbable: checkIsTabbable,
    last,
    onKeydown,
  } = useRovingFocus(
    () =>
      rows.value.map(({ value }, index) => ({ el: () => window.document.getElementById(getItemId(index)), id: value })),
    { circular: true, orientation: "vertical" },
  );
  const typeahead = useTypeahead();
  let isOpeningAtEnd = false;
  const openAtEnd = () => {
    isOpeningAtEnd = true;
    open();
  };
  const closeToOpener = () => {
    close();
    returnFocusTo()?.focus();
  };
  const toggle = (value: T, isExpanded: boolean) => {
    expandedValues.value = isExpanded
      ? [...expandedValues.value, value]
      : expandedValues.value.filter((expandedValue) => expandedValue !== value);
  };
  // Closed before the item runs, so an item that opens a dialog keeps the focus that dialog takes
  const choose = async (value: T, event: KeyboardEvent | MouseEvent) => {
    const row = rows.value.find((item) => item.value === value);
    if (row?.isDisabled) return;

    if (row?.children) {
      toggle(value, !row.isExpanded);
      return;
    }

    closeToOpener();
    await onSelect(value, event);
  };
  const onMenuKeydown = async (event: KeyboardEvent) => {
    const itemsValue = rows.value;
    if (event.key === "Escape") {
      event.preventDefault();
      closeToOpener();
    } else if (event.key === "Tab") close();
    else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const focusedItem = itemsValue.find(({ value }) => value === focusedId.value);
      if (focusedItem) await choose(focusedItem.value, event);
    } else if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      const focusedItem = itemsValue.find(({ value }) => value === focusedId.value);
      if (!focusedItem) return;
      // A child's left arrow shuts its group and goes back to the group's heading, which is the row that opened it
      const parent = toValue(items).find(({ children }) => children?.some(({ value }) => value === focusedItem.value));
      if (event.key === "ArrowRight" && focusedItem.children && !focusedItem.isExpanded && !focusedItem.isDisabled) {
        event.preventDefault();
        toggle(focusedItem.value, true);
      } else if (event.key === "ArrowLeft" && focusedItem.children && focusedItem.isExpanded) {
        event.preventDefault();
        toggle(focusedItem.value, false);
      } else if (event.key === "ArrowLeft" && parent) {
        event.preventDefault();
        toggle(parent.value, false);
        await nextTick();
        focus(parent.value);
      }
    } else {
      const index = typeahead(
        event,
        itemsValue.map(({ title }) => title),
        itemsValue.findIndex(({ value }) => value === focusedId.value),
      );
      if (index === undefined) onKeydown(event);
      else focus(takeOne(itemsValue, index).value);
    }
  };
  // A tick on, once the popover is shown and its items drawn: an element in a closed popover takes no focus
  watch(isOpen, async (newIsOpen) => {
    if (!newIsOpen) {
      expandedValues.value = [];
      return;
    }

    const isAtEnd = isOpeningAtEnd;
    isOpeningAtEnd = false;
    await nextTick();
    if (isAtEnd) last();
    else first();
  });

  // The groups of a menu moved to another point are collapsed, as those of one opened afresh are
  const collapse = () => {
    expandedValues.value = [];
  };

  return { checkIsTabbable, choose, collapse, first, getItemId, onMenuKeydown, openAtEnd, rows };
};
