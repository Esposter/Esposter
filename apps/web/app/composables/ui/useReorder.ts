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
  const announce = <T>(values: T[], value: T) => {
    announcement.value = `Moved to position ${values.indexOf(value) + 1} of ${values.length}`;
  };
  return { announce, announcement, getKeyedOrder };
};
