import type { HookEntry } from "#src/models/HookEntry";

import { checkIsPluginHookEntry } from "#src/services/checkIsPluginHookEntry";
import { FOREIGN_HOOK_ENTRY } from "#src/services/constants.test";
import { getPluginSpeakHookEntry } from "#src/services/getPluginSpeakHookEntry";
import { parseJsonObject } from "#src/services/parseJsonObject";
import { describe, expect, test } from "vitest";

describe(checkIsPluginHookEntry, () => {
  test("reads the entry the voice verb wrote as ours", () => {
    expect.hasAssertions();

    expect(checkIsPluginHookEntry(getPluginSpeakHookEntry())).toBe(true);
  });

  test("leaves an entry someone else wrote under the same event alone", () => {
    expect.hasAssertions();

    expect(checkIsPluginHookEntry(FOREIGN_HOOK_ENTRY)).toBe(false);
  });

  test("reads an entry shaped unlike the model as nobody's", () => {
    expect.hasAssertions();

    // Read the way `readUserSettings` reads the file, which keeps an entry for its `hooks` array alone, since the
    // Shape inside it is what a hand edit can put there
    const entry = parseJsonObject('{"hooks":[null]}') as HookEntry;

    expect(checkIsPluginHookEntry(entry)).toBe(false);
  });
});
