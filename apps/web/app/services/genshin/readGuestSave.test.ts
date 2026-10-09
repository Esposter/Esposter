// @vitest-environment nuxt
import { useSaveToLocalStorage } from "@/composables/shared/useSaveToLocalStorage";
import { readGuestSave } from "@/services/genshin/readGuestSave";
import { LocalStorageKey } from "@/services/shared/LocalStorageKey";
import { EMPTY_GENSHIN_SAVE, genshinSaveSchema } from "genshin-world/save";
import { afterEach, describe, expect, test } from "vitest";

describe(readGuestSave, () => {
  afterEach(() => {
    localStorage.clear();
  });

  test("reads back the save the app wrote, its instants still ISO strings", () => {
    expect.hasAssertions();

    const saveToLocalStorage = useSaveToLocalStorage();
    saveToLocalStorage(LocalStorageKey.GenshinSave, genshinSaveSchema, EMPTY_GENSHIN_SAVE);
    expect(readGuestSave()).toStrictEqual(EMPTY_GENSHIN_SAVE);
  });
});
