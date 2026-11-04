import type { VueWrapper } from "@vue/test-utils";

import { describe } from "vitest";

// Finds the button whose whole text is the given label, for clicking a row's Remove, Cancel or Add action
export const getButtonByText = (component: VueWrapper, text: string) =>
  component.findAll("button").find((button) => button.text() === text);

describe.todo("getButtonByText");
