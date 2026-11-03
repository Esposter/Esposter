import type { SurveyListEditorOptions } from "@/models/resource/survey/SurveyListEditorOptions";
import type { SurveyListRow } from "@/models/resource/survey/SurveyListRow";

import { getMovedItems } from "@/services/shared/getMovedItems";
import { checkIsDeepEqual } from "@esposter/shared";

// A survey list's draft: its rows are held apart from the model, so a row the list refuses stays where it was typed,
// Flagged, while the model keeps the last list that was valid. The model is written only once every row is valid
export const useSurveyListEditor = <T extends object>(modelValue: Ref<T[]>, options: SurveyListEditorOptions<T>) => {
  const { announce, announcement, getKeyedOrder } = useReorder();
  let rowCount = 0;
  const createRow = (item: T): SurveyListRow<T> => {
    const id = String(rowCount);
    rowCount += 1;
    return { id, item };
  };
  // Shallow, since every change replaces the rows whole, and a generic item is not one a deep ref can unwrap
  const rows = shallowRef(modelValue.value.map((item) => createRow(item)));
  const getItems = () => rows.value.map(({ item }) => item);
  // The rows of a write this editor made already hold its items, so they keep their ids and the focus stays where it
  // Was; a change from outside, such as an undo, rebuilds them
  watch(modelValue, (items) => {
    if (!checkIsDeepEqual(items, getItems())) rows.value = items.map((item) => createRow(item));
  });
  // A key repeated within the list is flagged on every row after its first, so the first one stays as it was written
  const errors = computed(() => {
    const items = getItems();
    return items.map((item, index) => {
      const itemError = options.getItemError(item);
      if (itemError !== undefined) return itemError;

      const key = options.getKey(item);
      const isFirst = items.findIndex((other) => options.getKey(other) === key) === index;
      return isFirst ? undefined : options.duplicateMessage;
    });
  });
  const isValid = computed(() => errors.value.every((error) => error === undefined));
  const commit = () => {
    const items = getItems();
    if (isValid.value && !checkIsDeepEqual(items, modelValue.value)) modelValue.value = items;
  };
  const addItems = (items: T[]) => {
    rows.value = [...rows.value, ...items.map((item) => createRow(item))];
    commit();
  };
  const updateItem = (id: string, update: Partial<T>) => {
    rows.value = rows.value.map((row) => (row.id === id ? { ...row, item: { ...row.item, ...update } } : row));
    commit();
  };
  const removeItem = (id: string) => {
    rows.value = rows.value.filter((row) => row.id !== id);
    commit();
  };
  // A move the list cannot make, past either end, changes nothing and is not written
  const moveItem = (id: string, toIndex: number) => {
    const moved = getMovedItems(
      rows.value,
      rows.value.findIndex((row) => row.id === id),
      toIndex,
    );
    if (!moved) return;

    rows.value = moved;
    commit();
  };
  // Alt+Up and Alt+Down move the row one place and are read out through the live region. The key belongs to the row it
  // Is pressed in even at an end, so a row nested in another never hands its Alt+arrow to the row around it. The focus
  // Is put back on the element that had it, since a moved element loses it
  const onRowKeydown = async (event: KeyboardEvent, id: string) => {
    if (event.altKey) event.stopPropagation();

    const ids = rows.value.map((row) => row.id);
    const keyedOrder = getKeyedOrder(event, ids, ids.indexOf(id));
    if (!keyedOrder) return;

    event.preventDefault();
    const { target } = event;
    moveItem(id, keyedOrder.indexOf(id));
    announce(keyedOrder, id);
    await nextTick();
    if (target instanceof HTMLElement) target.focus();
  };

  return { addItems, announcement, errors, moveItem, onRowKeydown, removeItem, rows, updateItem };
};
