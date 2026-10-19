import { describe } from "vitest";

// The id of the item focus is on, read from the element it sits on
export const getFocusedId = () =>
  document.activeElement instanceof HTMLElement ? document.activeElement.dataset.itemId : undefined;

describe.todo("getFocusedId");
