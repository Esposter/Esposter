import type { VueWrapper } from "@vue/test-utils";

import { describe } from "vitest";

// The input a field's label names, found through the label's id
export const getFieldInput = (component: VueWrapper, label: string) => {
  const forId = component
    .findAll("label")
    .find((element) => element.text() === label)
    ?.attributes("for");
  return component.get(`input[id="${forId}"]`);
};

describe.todo("getFieldInput");
