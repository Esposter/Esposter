import type { VueWrapper } from "@vue/test-utils";

import { describe } from "vitest";

// A compact window rises every sheet from the bottom, so the sheet a test means is the one named by its region
export const findSheet = (component: VueWrapper, regionName: string) =>
  component.findAll<HTMLDialogElement>("dialog").find((dialog) => dialog.text().startsWith(regionName));

describe.todo(findSheet);
