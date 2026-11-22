import type { UiListItem } from "#src/models/ui/UiListItem";

import { takeOne } from "@esposter/shared";
import { useRovingFocus } from "@vuetify/v0";

// A list's keyboard, and the reorder its rows take by a key or a drag: the arrows, Home and End walk the rows, typing
// Jumps to a title, and Alt with an arrow moves a row within its group. Rows sharing a group sit together under its
// Heading, in the order they come
export const useListKeyboard = <T extends string, TListItem extends UiListItem<T>>(
  getItems: () => TListItem[],
  getIsReorderable: () => true | undefined,
  onReorder: (values: T[]) => void,
) => {
  const listId = useId();
  const getRowId = (value: T) => `${listId}-${value}`;
  const { focus, focusedId, onKeydown } = useRovingFocus(
    () => getItems().map(({ value }) => ({ el: () => window.document.getElementById(getRowId(value)), id: value })),
    { orientation: "vertical" },
  );
  const typeahead = useTypeahead();
  const { announcement, reorderByKey } = useReorder();
  const getDragReorderProps = useDragReorder();
  const groups = computed(() => {
    const rowGroups: { group?: string | undefined; items: TListItem[] }[] = [];
    for (const item of getItems()) {
      const lastRowGroup = rowGroups.at(-1);
      if (lastRowGroup && lastRowGroup.group === item.group) lastRowGroup.items.push(item);
      else rowGroups.push({ group: item.group, items: [item] });
    }
    return rowGroups;
  });
  // The whole list's order with one group's rows in their new order
  const reorder = (groupIndex: number, groupValues: T[]) => {
    const values = groups.value.flatMap(({ items: groupItems }, index) =>
      index === groupIndex ? groupValues : groupItems.map(({ value: groupValue }) => groupValue),
    );
    onReorder(values);
  };
  // What a group's rows take while they drag: their new order is handed back as the whole list's
  const getReorderProps = (groupIndex: number, groupItems: TListItem[]) =>
    getDragReorderProps(groupItems, (newGroupItems) => {
      reorder(
        groupIndex,
        newGroupItems.map(({ value }) => value),
      );
    });
  const onListKeydown = async (event: KeyboardEvent) => {
    const row = event.target;
    // Only a row's own keys: the actions beside it keep theirs
    if (!(row instanceof HTMLElement)) return;
    const items = getItems();
    const index = items.findIndex(({ value }) => getRowId(value) === row.id);
    if (index === -1) return;

    const groupIndex = groups.value.findIndex(({ items: groupItems }) =>
      groupItems.some(({ value }) => getRowId(value) === row.id),
    );
    const groupValues = groups.value[groupIndex]?.items.map(({ value }) => value) ?? [];
    const value = takeOne(items, index).value;
    const movedRow = getIsReorderable()
      ? reorderByKey(
          event,
          groupValues,
          value,
          (keyedOrder) => {
            reorder(groupIndex, keyedOrder);
          },
          () => {
            focus(value);
          },
        )
      : undefined;
    if (movedRow) await movedRow;
    else if (event.key === "Enter" || event.key === " ") {
      // A button presses itself on either; an option and a link are pressed here
      if (row instanceof HTMLButtonElement) return;
      event.preventDefault();
      row.click();
    } else {
      const typedIndex = typeahead(
        event,
        items.map(({ title }) => title),
        index,
      );
      if (typedIndex === undefined) onKeydown(event);
      else focus(takeOne(items, typedIndex).value);
    }
  };

  return { announcement, focus, focusedId, getReorderProps, getRowId, groups, onListKeydown };
};
