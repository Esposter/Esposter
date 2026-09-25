import type { UiStyle } from "@/models/ui/UiStyle";

import { UI_STYLE_INJECTION_KEY } from "@/services/ui/constants";
import { config } from "@vue/test-utils";
import { afterEach, beforeEach, describe } from "vitest";

// Every mount in the suite draws in the given style, as if a theme scope around it had pinned one: mount and
// MountSuspended both merge Vue Test Utils' global provide into their own
export const setupUiStyle = (uiStyle: UiStyle) => {
  let provide = config.global.provide;

  beforeEach(() => {
    provide = config.global.provide;
    config.global.provide = { ...provide, [UI_STYLE_INJECTION_KEY]: toRef(() => uiStyle) };
  });

  afterEach(() => {
    config.global.provide = provide;
  });
};

describe.todo("setupUiStyle");
