import type { UiMenuItem } from "@/models/ui/UiMenuItem";
import type { usePopover } from "@vuetify/v0";
import type { Promisable } from "type-fest";

import { takeOne } from "@esposter/shared";
import { useRovingFocus } from "@vuetify/v0";

interface UseMenuOptions<T extends string> {
  onSelect: (value: T, event: KeyboardEvent | MouseEvent) => Promisable<void>;
  // What takes focus back as the menu closes: its trigger, or the element a context menu opened over
  returnFocusTo: () => HTMLElement | undefined;
}

// A menu's keyboard contract over a popover, as the menu button pattern has it: it opens onto its first item, or its
// Last when the up arrow opened it; arrows, Home and End walk it and typeahead jumps; Enter or Space picks, Escape
// Closes, and either hands focus back. Where the popover hangs is the caller's, a trigger or a point
export const useMenu = <T extends string>(
  items: MaybeRefOrGetter<UiMenuItem<T>[]>,
  { close, id, isOpen, open }: Pick<ReturnType<typeof usePopover>, "close" | "id" | "isOpen" | "open">,
  { onSelect, returnFocusTo }: UseMenuOptions<T>,
) => {
  const getItemId = (index: number) => `${id}-item-${index}`;
  const { first, focus, focusedId, isTabbable, last, onKeydown } = useRovingFocus(
    () =>
      toValue(items).map(({ value }, index) => ({
        el: () => window.document.getElementById(getItemId(index)),
        id: value,
      })),
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
  // Closed before the item runs, so an item that opens a dialog keeps the focus that dialog takes
  const choose = async (value: T, event: KeyboardEvent | MouseEvent) => {
    if (toValue(items).find((item) => item.value === value)?.isDisabled) return;
    closeToOpener();
    await onSelect(value, event);
  };
  const onMenuKeydown = async (event: KeyboardEvent) => {
    const itemsValue = toValue(items);
    if (event.key === "Escape") {
      event.preventDefault();
      closeToOpener();
    } else if (event.key === "Tab") close();
    else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      const focusedItem = itemsValue.find(({ value }) => value === focusedId.value);
      if (focusedItem) await choose(focusedItem.value, event);
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
    if (!newIsOpen) return;
    const isAtEnd = isOpeningAtEnd;
    isOpeningAtEnd = false;
    await nextTick();
    if (isAtEnd) last();
    else first();
  });

  return { choose, first, getItemId, isTabbable, onMenuKeydown, openAtEnd };
};
