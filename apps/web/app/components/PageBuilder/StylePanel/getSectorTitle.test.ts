import type { VueWrapper } from "@vue/test-utils";

import { getFieldInput } from "#src/components/PageBuilder/StylePanel/getFieldInput.test";
import { describe } from "vitest";

// The title of the sector a field is drawn in, read off the sector's content, which its header labels
export const getSectorTitle = (component: VueWrapper, label: string) => {
  const content = getFieldInput(component, label).element.closest("[aria-labelledby]");
  return component.get(`[id="${content?.getAttribute("aria-labelledby")}"]`).text();
};

describe.todo("getSectorTitle");
