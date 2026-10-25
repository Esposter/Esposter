import { getMovedItems } from "@/services/shared/getMovedItems";

// The order the key leaves the values in, or undefined when it moves nothing: another key or chord, or a row already
// At the end it is moving towards
export const getKeyedOrder = <T>(event: KeyboardEvent, values: T[], index: number) => {
  if (!event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return undefined;
  else if (event.key === "ArrowUp") return getMovedItems(values, index, index - 1);
  else if (event.key === "ArrowDown") return getMovedItems(values, index, index + 1);
  else return undefined;
};
