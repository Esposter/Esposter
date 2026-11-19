import { getKeyedOrder } from "#src/services/ui/getKeyedOrder";

// A reorderable list's keyboard half, since a drag is never the only way to do a thing: Alt+Up and Alt+Down move the
// Focused row one place, each move read out through a live region
export const useReorder = () => {
  const announcement = ref("");
  const { start: startRestoreAnnouncement, stop: stopRestoreAnnouncement } = useTimeoutFn(
    (message: string) => {
      announcement.value = message;
    },
    0,
    { immediate: false },
  );
  // A live region only announces a change to what it already holds, so a move landing on the same message as the last
  // Clears it and says it again a task later — cancelled by a newer move, whose message is the one that stands
  const announce = <T>(values: T[], value: T) => {
    const message = `Moved to position ${values.indexOf(value) + 1} of ${values.length}`;
    stopRestoreAnnouncement();
    if (announcement.value === message) {
      announcement.value = "";
      startRestoreAnnouncement(message);
    } else announcement.value = message;
  };
  // A key's move of one value within its group: the new order goes to onReorder and is read out, and focus goes back to
  // The value once it is drawn in its new place, since a moved element loses focus on the way. Undefined when no key moved it
  const reorderByKey = <T>(
    event: KeyboardEvent,
    values: T[],
    value: T,
    onReorder: (keyedOrder: T[]) => void,
    focusValue: () => void,
  ) => {
    const keyedOrder = getKeyedOrder(event, values, values.indexOf(value));
    if (!keyedOrder) return undefined;

    event.preventDefault();
    onReorder(keyedOrder);
    announce(keyedOrder, value);
    return nextTick(focusValue);
  };
  return { announcement, reorderByKey };
};
