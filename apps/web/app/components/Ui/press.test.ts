import { getFocusedId } from "@/components/Ui/getFocusedId.test";
import { flushPromises } from "@vue/test-utils";
import { assert, describe } from "vitest";

// Presses a key on the focused element, lets the tree settle, and reads the id focus moved to
export const press = async (key: string) => {
  assert.exists(document.activeElement);
  document.activeElement.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, key }));
  await flushPromises();
  return getFocusedId();
};

describe.todo("press");
