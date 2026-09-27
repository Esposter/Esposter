import { getMovedItems } from "@/services/shared/getMovedItems";

// The order the key leaves the values in, or undefined when it moves nothing: another key or chord, or a row already
// At the end it is moving towards
const getKeyedOrder = <T>(event: KeyboardEvent, values: T[], index: number) => {
  if (!event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return undefined;
  else if (event.key === "ArrowUp") return getMovedItems(values, index, -1);
  else if (event.key === "ArrowDown") return getMovedItems(values, index, 1);
  return undefined;
};

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
  return { announce, announcement, getKeyedOrder };
};
